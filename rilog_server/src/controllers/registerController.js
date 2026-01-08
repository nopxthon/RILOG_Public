'use strict';

const { Otp_verify } = require('../models');
const sendEmail = require('../utils/sendEmail'); // ✅ Import fungsi yang benar
const otpTemplate = require('../templates/otpTemplate');

// ===================================================================
// 🟢 LANGKAH 1: USER REQUEST OTP UNTUK REGISTER
// ===================================================================
exports.registerRequestOtp = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi.' });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid.' });
    }

    // Buat kode OTP (6 digit)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // Berlaku 5 menit

    console.log(`\n🔐 Creating OTP for: ${email}`);
    console.log(`   OTP Code: ${otpCode}`);
    console.log(`   Expires: ${expiredAt.toLocaleString('id-ID')}`);

    // Simpan OTP
    await Otp_verify.create({
      email,
      otp_code: otpCode,
      expired_at: expiredAt,
    });

    console.log('   ✅ OTP saved to database');

    // ✅ Kirim email menggunakan fungsi sendEmail yang sudah ada (dengan rotasi & retry)
    try {
      const emailResult = await sendEmail(
        email,
        'Kode Verifikasi OTP RILOG',
        otpTemplate(otpCode, username || "Pengguna")
      );

      console.log('   ✅ Email sent successfully');
      
      // Jika mock mode
      if (emailResult.mock) {
        return res.status(200).json({
          message: 'OTP berhasil dibuat (Development Mode - Email tidak dikirim)',
          email,
          otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined, // Tampilkan OTP di development
          mockMode: true,
        });
      }

      // Jika email real terkirim
      return res.status(200).json({
        message: 'OTP telah dikirim ke email Anda. Silakan verifikasi untuk melanjutkan registrasi.',
        email,
      });

    } catch (emailError) {
      console.error('   ❌ Email sending failed:', emailError.message);
      
      // Tetap berhasil buat OTP, tapi email gagal
      return res.status(200).json({
        message: 'OTP berhasil dibuat, tetapi gagal mengirim email. Gunakan OTP berikut untuk development.',
        email,
        otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined,
        warning: 'Email tidak terkirim - gunakan OTP di console',
      });
    }

  } catch (error) {
    console.error('❌ Register OTP error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat membuat OTP.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};