'use strict';

const { 
    Pengajuan_Pembayaran, 
    Sub_plan, 
    Bisnis, 
    User, 
    LogVerifikasi, 
    Gudang 
} = require('../models');
const path = require('path');
const fs = require('fs');

const { sendPaymentNotificationToAdmin,sendPaymentStatusToUser } = require('../utils/emailService');

/**
 * ==========================================
 * 1. USER: KIRIM PEMBAYARAN (Upload Bukti)
 * ==========================================
 */
const createPayment = async (req, res) => {
    try {
        const { sub_plan_id, nama_pengirim, bank_pengirim, keterangan } = req.body;
        const user = req.userInstance;

        if (!req.file) {
            return res.status(400).json({ message: "Bukti pembayaran wajib diupload." });
        }

        const plan = await Sub_plan.findByPk(sub_plan_id);
        if (!plan) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "Paket tidak ditemukan." });
        }

        const buktiPath = `/uploads/payments/${req.file.filename}`;

        const pengajuan = await Pengajuan_Pembayaran.create({
            bisnis_id: user.bisnis_id,
            user_id: user.id,
            sub_plan_id: plan.id,
            total_bayar: plan.harga,
            durasi_paket: plan.durasi_hari || 30, // Menggunakan kolom durasi_hari dari sub_plan
            nama_pengirim,
            bank_pengirim,
            bukti_pembayaran: buktiPath,
            keterangan: keterangan || `Pembayaran paket ${plan.nama_paket}`,
            status: 'pending',
            tanggal_pengajuan: new Date()
        });

        await sendPaymentNotificationToAdmin(
            pengajuan,          // Data pembayaran
            plan.nama_paket,    // Nama paket
            user.name || user.username || "User RILOG" // Nama user (pilih kolom yg ada di DB user)
        );

        res.status(201).json({ message: "Berhasil dikirim.", data: pengajuan });

    } catch (error) {
        console.error("Error create payment:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "Gagal memproses." });
    }
};

/**
 * ==========================================
 * 2. USER: LIHAT RIWAYAT SENDIRI
 * ==========================================
 */
const getMyPayments = async (req, res) => {
    try {
        const user = req.userInstance;
        const data = await Pengajuan_Pembayaran.findAll({
            where: { bisnis_id: user.bisnis_id },
            order: [['created_at', 'DESC']],
            include: [{ model: Sub_plan, as: 'subPlan', attributes: ['nama_paket', 'harga'] }]
        });
        res.json({ status: "success", data });
    } catch (error) {
        console.error("Error get my payments:", error);
        res.status(500).json({ message: "Gagal mengambil data." });
    }
};

/**
 * ==========================================
 * 3. SUPERADMIN: LIHAT SEMUA PEMBAYARAN
 * ==========================================
 */
const getAllPayments = async (req, res) => {
    try {
        const { status } = req.query;
        let whereClause = {};

        // Filter Sesuai Tab Frontend
        if (status === 'Terverifikasi') whereClause.status = 'disetujui';
        if (status === 'Belum Terverifikasi') whereClause.status = 'pending';
        if (status === 'Ditolak') whereClause.status = 'ditolak';

        const payments = await Pengajuan_Pembayaran.findAll({
            where: whereClause,
            // 🔥 UPDATE DI SINI: Urutkan dari yang terbaru (DESC)
            order: [['created_at', 'DESC']], 
            include: [
                { model: User, as: 'user', attributes: [['name', 'nama'], 'email'] },
                { model: Bisnis, as: 'bisnis', attributes: ['nama_bisnis'] },
                { model: Sub_plan, as: 'subPlan', attributes: ['nama_paket', 'harga'] }
            ]
        });

        // 🔥 UPDATE DI SINI: Tambahkan 'keterangan'
        const formattedData = payments.map(p => ({
            id: p.id,
            bisnis: p.bisnis ? p.bisnis.nama_bisnis : 'Tanpa Bisnis',
            pemilik: p.user ? p.user.dataValues.nama : '-',
            email: p.user ? p.user.email : '-',
            pengirim: p.nama_pengirim || '-',
            bank: p.bank_pengirim || '-',
            paket: p.subPlan ? p.subPlan.nama_paket : '-',
            tanggal: p.tanggal_pengajuan,
            jumlah: p.total_bayar,
            status: p.status === 'disetujui' ? 'Terverifikasi' : (p.status === 'pending' ? 'Belum Terverifikasi' : 'Ditolak'),
            bukti: p.bukti_pembayaran,
            keterangan: p.keterangan || '-' // ✅ TAMBAHKAN INI
        }));

        res.json(formattedData);
    } catch (error) {
        console.error("Error get all payments:", error);
        res.status(500).json({ message: "Gagal mengambil data." });
    }
};

/**
 * ==========================================
 * 4. SUPERADMIN: VERIFIKASI (Approve/Reject)
 * ==========================================
 */
const verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes } = req.body;

        // 🔥 UPDATE 1: Include User & Sub_plan agar bisa kirim email
        const transaksi = await Pengajuan_Pembayaran.findByPk(id, {
            include: [
                { model: Bisnis, as: 'bisnis' },
                { model: User, as: 'user', attributes: ['name', 'email'] }, // Ambil Email & Nama
                { model: Sub_plan, as: 'subPlan', attributes: ['nama_paket'] } // Ambil Nama Paket
            ]
        });

        if (!transaksi) return res.status(404).json({ msg: "Transaksi tidak ditemukan" });

        // Siapkan variabel untuk email
        const userEmail = transaksi.user?.email;
        const userName = transaksi.user?.name || "User RILOG";
        const planName = transaksi.subPlan?.nama_paket || "Paket Langganan";

        if (action === 'approve') {
            // A. Update Status
            await transaksi.update({ status: 'disetujui' });

            const bisnis = transaksi.bisnis;
            if (bisnis) {
                // ... (Logika update tanggal & reset aset TETAP SAMA seperti sebelumnya) ...
                // Copy-paste logika update tanggal & reset aset di sini (Gudang/Staff)
                // Biar kode tidak kepanjangan saya skip tulis ulang, tapi JANGAN DIHAPUS ya.
                
                let newStartDate = new Date();
                if (bisnis.sub_status === 'aktif' && bisnis.sub_end && new Date(bisnis.sub_end) > new Date()) {
                    newStartDate = new Date(bisnis.sub_end);
                }
                const durasi = transaksi.durasi_paket || 30;
                let newEndDate = new Date(newStartDate);
                newEndDate.setDate(newEndDate.getDate() + durasi);

                await bisnis.update({
                    sub_status: 'aktif',
                    sub_start: new Date(),
                    sub_end: newEndDate,
                    sub_plan_id: transaksi.sub_plan_id
                });
                
                await Gudang.update({ is_active: false }, { where: { bisnis_id: bisnis.id } });
                await User.update({ status: 'suspended' }, { where: { bisnis_id: bisnis.id, role: 'staff' } });

                if (req.user) {
                    await LogVerifikasi.create({ 
                        user_id: req.user.id, role: 'Super Admin', aksi: 'Approve & Reset Aset', 
                        keterangan: `Approve ID ${id}. Bisnis: ${bisnis.nama_bisnis}.` 
                    });
                }
            }

            // 🔥 UPDATE 2: Kirim Email DITERIMA
            if (userEmail) {
                sendPaymentStatusToUser(userEmail, userName, planName, 'disetujui');
            }

        } else if (action === 'reject') {
            // Update Status Reject
            await transaksi.update({ 
                status: 'ditolak',
                keterangan: notes ? `DITOLAK: ${notes}` : 'Pembayaran ditolak oleh Admin.'
            });
            
            if (req.user) {
                await LogVerifikasi.create({ 
                    user_id: req.user.id, role: 'Super Admin', aksi: 'Reject Pembayaran', 
                    keterangan: `Reject ID ${id}. Alasan: ${notes || '-'}` 
                });
            }

            // 🔥 UPDATE 3: Kirim Email DITOLAK
            if (userEmail) {
                sendPaymentStatusToUser(userEmail, userName, planName, 'ditolak', notes);
            }
        }

        res.json({ msg: "Status berhasil diperbarui dan notifikasi dikirim ke user." });
    } catch (error) {
        console.error("Error verify:", error);
        res.status(500).json({ msg: "Gagal memproses verifikasi." });
    }
};

const getMySubscription = async (req, res) => {
  try {
    const user = req.userInstance; // Didapat dari authMiddleware

    if (!user || !user.bisnis_id) {
      return res.status(404).json({ message: "Data bisnis tidak ditemukan." });
    }

    // Cari Bisnis user & Paket yang sedang aktif
    const bisnis = await Bisnis.findByPk(user.bisnis_id, {
      include: [
        { 
          model: Sub_plan, 
          as: 'subPlan', // Pastikan sesuai alias di model (default: subPlan / Sub_plan)
          attributes: ['id', 'nama_paket', 'limit_gudang', 'limit_staff', 'harga']
        }
      ],
      attributes: ['id', 'nama_bisnis', 'sub_status', 'sub_end']
    });

    if (!bisnis) {
      return res.status(404).json({ message: "Bisnis tidak ditemukan." });
    }

    res.json({
      status: "success",
      data: {
        Sub_plan: bisnis.subPlan // Data ini yang dicari Frontend
      }
    });

  } catch (error) {
    console.error("Error getMySubscription:", error);
    res.status(500).json({ message: "Gagal mengambil data langganan." });
  }
};

module.exports = {
    createPayment,
    getMyPayments,
    getAllPayments,
    verifyPayment,
    getMySubscription
};