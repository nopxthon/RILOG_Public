// src/controllers/passwordController.js
const bcrypt = require("bcryptjs");
const { User } = require("../models");

/**
 * @route   PUT /api/password/change
 * @desc    Ubah kata sandi user yang sedang login
 * @access  Private (butuh token)
 */
const changePassword = async (req, res) => {
  try {
    const { kataSandiLama, kataSandiBaru, konfirmasiKataSandi } = req.body;
    const userId = req.user.id; // Dari authMiddleware

    // ✅ Validasi input
    if (!kataSandiLama || !kataSandiBaru || !konfirmasiKataSandi) {
      return res.status(400).json({
        status: "error",
        message: "Semua field harus diisi",
      });
    }

    // ✅ Cek kata sandi baru dan konfirmasi cocok
    if (kataSandiBaru !== konfirmasiKataSandi) {
      return res.status(400).json({
        status: "error",
        message: "Kata sandi baru dan konfirmasi tidak cocok",
      });
    }

    // ✅ Validasi panjang kata sandi baru (minimal 6 karakter)
    if (kataSandiBaru.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Kata sandi baru minimal 6 karakter",
      });
    }

    // ✅ Ambil data user dari database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    // ✅ Verifikasi kata sandi lama
    const isPasswordValid = await bcrypt.compare(kataSandiLama, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Kata sandi lama tidak sesuai",
      });
    }

    // ✅ Cek apakah kata sandi baru sama dengan kata sandi lama
    const isSamePassword = await bcrypt.compare(kataSandiBaru, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        status: "error",
        message: "Kata sandi baru tidak boleh sama dengan kata sandi lama",
      });
    }

    // ✅ Hash kata sandi baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(kataSandiBaru, salt);

    // ✅ Update password di database
    await user.update({ password: hashedPassword });

    return res.status(200).json({
      status: "success",
      message: "Kata sandi berhasil diperbarui",
    });
  } catch (error) {
    console.error("❌ Error changePassword:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      detail: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  changePassword,
};