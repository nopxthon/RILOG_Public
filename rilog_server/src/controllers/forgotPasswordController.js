// src/controllers/forgotPasswordController.js
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/**
 * Forgot Password - Generate reset token dan kirim email
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email wajib diisi",
      });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Email tidak terdaftar dalam sistem",
      });
    }

    // Generate token reset (32 karakter random)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 jam dari sekarang

    // Simpan token ke database
    user.reset_password_token = resetToken;
    user.reset_password_expires = resetTokenExpires;
    await user.save();

    // URL reset password
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Template email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Kata Sandi RILOG</h1>
          </div>
          <div class="content">
            <p>Halo <strong>${user.name}</strong>,</p>
            <p>Kami menerima permintaan untuk mereset kata sandi akun Anda di RILOG.</p>
            <p>Klik tombol di bawah ini untuk mereset kata sandi Anda:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Kata Sandi</a>
            </p>
            <p>Atau salin dan tempel URL berikut ke browser Anda:</p>
            <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            <p><strong>Link ini akan kadaluarsa dalam 1 jam.</strong></p>
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RILOG. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Kirim email
    await sendEmail(email, "Reset Kata Sandi RILOG", emailHtml);

    return res.status(200).json({
      status: "success",
      message: "Link reset password telah dikirim ke email Anda",
    });
  } catch (error) {
    console.error("❌ forgotPassword error:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal memproses permintaan reset password",
      detail: error.message,
    });
  }
};

/**
 * Reset Password - Verifikasi token dan update password baru
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Token dan password baru wajib diisi",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal 6 karakter",
      });
    }

    // Cari user dengan token yang valid dan belum kadaluarsa
    const user = await User.findOne({
      where: {
        reset_password_token: token,
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Token reset password tidak valid",
      });
    }

    // Cek apakah token sudah kadaluarsa
    if (new Date() > user.reset_password_expires) {
      return res.status(400).json({
        status: "error",
        message: "Token reset password telah kadaluarsa. Silakan minta link baru",
      });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password dan hapus token
    user.password = hashedPassword;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    // Kirim email konfirmasi
    const confirmEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Kata Sandi Berhasil Direset</h1>
          </div>
          <div class="content">
            <p>Halo <strong>${user.name}</strong>,</p>
            <p>Kata sandi Anda telah berhasil direset.</p>
            <p>Anda sekarang dapat login menggunakan kata sandi baru Anda.</p>
            <p>Jika Anda tidak melakukan perubahan ini, segera hubungi tim support kami.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RILOG. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(user.email, "Kata Sandi Berhasil Direset", confirmEmailHtml);

    return res.status(200).json({
      status: "success",
      message: "Password berhasil direset. Silakan login dengan password baru",
    });
  } catch (error) {
    console.error("❌ resetPassword error:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mereset password",
      detail: error.message,
    });
  }
};