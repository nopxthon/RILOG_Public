// controllers/authController.js
const bcrypt = require('bcrypt');
const { User } = require('../models');

/**
 * @route   PUT /api/auth/change-password
 * @desc    Ubah kata sandi user
 * @access  Private (memerlukan authentication)
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id; // Dari middleware authentication

    // Validasi input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi',
      });
    }

    // Validasi password baru dan konfirmasi cocok
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi baru dan konfirmasi tidak cocok',
      });
    }

    // Validasi panjang password minimal 6 karakter
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi baru minimal 6 karakter',
      });
    }

    // Cek password lama tidak boleh sama dengan password baru
    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi baru harus berbeda dengan kata sandi lama',
      });
    }

    // Ambil user dari database
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Kata sandi lama tidak sesuai',
      });
    }

    // Hash password baru
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password di database
    await user.update({
      password: hashedPassword,
    });

    // Log activity (opsional)
    if (req.models && req.models.ActivityLog) {
      await req.models.ActivityLog.create({
        user_id: userId,
        action: 'change_password',
        description: 'User mengubah kata sandi',
        ip_address: req.ip,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Kata sandi berhasil diubah',
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};