// src/controllers/superadminDataPengguna.controller.js

const { Superadmin } = require("../models");
const { Op } = require("sequelize");

/**
 * 📝 GET Profile Superadmin
 * Mengambil data profil superadmin yang sedang login
 */
const getProfile = async (req, res) => {
  try {
    const superadminId = req.user.id;

    const superadmin = await Superadmin.findByPk(superadminId, {
      attributes: [
        "id",
        "username",
        "first_name",
        "last_name",
        "email",
        "phone",
        "profile_image",
        "created_at",
        "updated_at",
      ],
    });

    if (!superadmin) {
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    // Generate URL lengkap untuk profile image
    const profileImageUrl = superadmin.profile_image
      ? `${req.protocol}://${req.get("host")}/uploads/profile/${superadmin.profile_image}`
      : null;

    return res.status(200).json({
      status: "success",
      message: "Data profil berhasil diambil",
      data: {
        ...superadmin.toJSON(),
        profile_image_url: profileImageUrl,
      },
    });
  } catch (error) {
    console.error("❌ Error get profile:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data profil",
      error: error.message,
    });
  }
};

/**
 * ✏️ UPDATE Profile Superadmin
 * Mengupdate data profil superadmin (tanpa password dan profile_image)
 */
const updateProfile = async (req, res) => {
  try {
    const superadminId = req.user.id;
    const { first_name, last_name, email, phone } = req.body;

    // Validasi input
    if (!first_name || !last_name) {
      return res.status(400).json({
        status: "error",
        message: "Nama depan dan nama belakang wajib diisi",
      });
    }

    // Validasi email format (jika diisi)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: "error",
          message: "Format email tidak valid",
        });
      }
    }

    // Cek apakah superadmin ada
    const superadmin = await Superadmin.findByPk(superadminId);
    if (!superadmin) {
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    // Cek apakah email sudah digunakan oleh superadmin lain
    if (email && email !== superadmin.email) {
      const emailExists = await Superadmin.findOne({
        where: {
          email,
          id: { [Op.ne]: superadminId },
        },
      });

      if (emailExists) {
        return res.status(400).json({
          status: "error",
          message: "Email sudah digunakan oleh superadmin lain",
        });
      }
    }

    // Update data
    await superadmin.update({
      first_name,
      last_name,
      email: email || null,
      phone: phone || null,
    });

    // Generate URL lengkap untuk profile image
    const profileImageUrl = superadmin.profile_image
      ? `${req.protocol}://${req.get("host")}/uploads/profile/${superadmin.profile_image}`
      : null;

    return res.status(200).json({
      status: "success",
      message: "Profil berhasil diperbarui",
      data: {
        id: superadmin.id,
        username: superadmin.username,
        first_name: superadmin.first_name,
        last_name: superadmin.last_name,
        email: superadmin.email,
        phone: superadmin.phone,
        profile_image: superadmin.profile_image,
        profile_image_url: profileImageUrl,
      },
    });
  } catch (error) {
    console.error("❌ Error update profile:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal memperbarui profil",
      error: error.message,
    });
  }
};

/**
 * 🔍 GET All Superadmins (Optional - untuk list admin)
 * Mengambil daftar semua superadmin
 */
const getAllSuperadmins = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};

    // Search by name, username, or email
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Superadmin.findAndCountAll({
      where,
      attributes: [
        "id",
        "username",
        "first_name",
        "last_name",
        "email",
        "phone",
        "profile_image",
        "created_at",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    // Generate URL untuk setiap profile image
    const superadminsWithUrl = rows.map((admin) => ({
      ...admin.toJSON(),
      profile_image_url: admin.profile_image
        ? `${req.protocol}://${req.get("host")}/uploads/profile/${admin.profile_image}`
        : null,
    }));

    return res.status(200).json({
      status: "success",
      message: "Data superadmin berhasil diambil",
      data: superadminsWithUrl,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error get all superadmins:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data superadmin",
      error: error.message,
    });
  }
};

/**
 * 🗑️ DELETE Profile Data (Soft Delete - Optional)
 * Menghapus data tertentu dari profil
 */
const deleteProfileData = async (req, res) => {
  try {
    const superadminId = req.user.id;
    const { field } = req.params; // field: 'email' atau 'phone'

    const allowedFields = ["email", "phone"];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        status: "error",
        message: "Field yang dapat dihapus hanya email atau phone",
      });
    }

    const superadmin = await Superadmin.findByPk(superadminId);
    if (!superadmin) {
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    // Set field menjadi null
    await superadmin.update({
      [field]: null,
    });

    return res.status(200).json({
      status: "success",
      message: `${field === "email" ? "Email" : "Nomor telepon"} berhasil dihapus`,
    });
  } catch (error) {
    console.error("❌ Error delete profile data:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal menghapus data profil",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllSuperadmins,
  deleteProfileData,
};