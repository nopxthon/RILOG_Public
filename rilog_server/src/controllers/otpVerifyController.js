'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Bisnis, Gudang, Otp_verify, Sub_plan } = require('../models');

// 🔥 NAMA FUNGSI TETAP SAMA (verifyOtpAndCreateAccount)
exports.verifyOtpAndCreateAccount = async (req, res) => {
  const t = await User.sequelize.transaction(); // Mulai Transaksi

  try {
    const {
      username, email, password, confirmPassword,
      nama_bisnis, tipe_bisnis, nama_gudang, otp_code,
    } = req.body;

    // 1. Validasi Input
    if (!username || !email || !password || !confirmPassword || !nama_bisnis || !otp_code) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Konfirmasi password tidak cocok.' });
    }

    // 2. Periksa OTP
    const otpRecord = await Otp_verify.findOne({
      where: { email, otp_code },
      order: [['createdAt', 'DESC']],
    });

    if (!otpRecord) return res.status(400).json({ message: 'Kode OTP tidak valid.' });
    if (new Date(otpRecord.expired_at) < new Date()) return res.status(400).json({ message: 'Kode OTP kedaluwarsa.' });

    // 3. Cek Email Terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Akun dengan email ini sudah terdaftar.' });

    // ============================================
    // 🔥 CARI PAKET TRIAL
    // ============================================
    const trialPlan = await Sub_plan.findOne({
      where: {
        [Op.or]: [{ nama_paket: { [Op.like]: '%Trial%' } }, { tipe: 'trial' }]
      }
    });
    const trialPlanId = trialPlan ? trialPlan.id : null;

    // ============================================
    // 🔥 HITUNG TANGGAL MANUAL (Biar Data Pasti Masuk)
    // ============================================
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 14); // 14 Hari kedepan

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ============================================
    // 🚀 CREATE DATA
    // ============================================

    // A. Buat User
    const user = await User.create({
      name: username,
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    }, { transaction: t });

    // B. Buat Bisnis (Dengan Tanggal Eksplisit)
    const bisnis = await Bisnis.create({
      nama_bisnis,
      tipe_bisnis: tipe_bisnis || 'Retail',
      user_id: user.id,
      sub_plan_id: trialPlanId,
      
      // ✅ SET TANGGAL MANUAL
      sub_status: 'aktif',
      sub_start: now,
      sub_end: endDate
    }, { transaction: t });

    // C. Update User
    await user.update({ bisnis_id: bisnis.id }, { transaction: t });

    // D. Buat Gudang
    const gudang = await Gudang.create({
      nama_gudang: nama_gudang || "Gudang Utama",
      bisnis_id: bisnis.id,
      is_active: true
    }, { transaction: t });

    // E. Hapus OTP
    await Otp_verify.destroy({ where: { email }, transaction: t });

    // ✅ COMMIT
    await t.commit();

    // ============================================
    // 🔑 GENERATE TOKEN (AUTO LOGIN)
    // ============================================
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        bisnis_id: bisnis.id 
      },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      message: 'Verifikasi berhasil! Akun aktif dengan Paket Trial.',
      data: {
        token, // ✅ Token untuk frontend
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          paket: trialPlan ? trialPlan.nama_paket : 'Standard'
        },
        bisnis: {
          id: bisnis.id,
          nama_bisnis: bisnis.nama_bisnis,
        }
      },
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ OTP Verify Error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan saat verifikasi OTP.',
      error: error.message,
    });
  }
};