// src/controllers/superadminProfile.js
const { Superadmin } = require("../models");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// ========================================
// 📸 CONFIG MULTER UNTUK UPLOAD FOTO
// ========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/profile");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `superadmin-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Hanya file gambar (jpg, jpeg, png, gif) yang diizinkan"));
  },
}).single("profile_image");

// ========================================
// 📖 GET PROFILE
// ========================================
exports.getProfile = async (req, res) => {
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
      ],
    });

    if (!superadmin) {
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    // Buat URL lengkap untuk profile image
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const profileImageUrl = superadmin.profile_image
      ? `${baseUrl}/uploads/profile/${superadmin.profile_image}`
      : null;

    res.status(200).json({
      status: "success",
      message: "Data profil berhasil diambil",
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
    console.error("❌ Error get profile:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data profil",
      detail: error.message,
    });
  }
};

// ========================================
// ✏️ UPDATE PROFILE
// ========================================
exports.updateProfile = async (req, res) => {
  try {
    const superadminId = req.user.id;
    const { first_name, last_name, email, phone } = req.body;

    const superadmin = await Superadmin.findByPk(superadminId);

    if (!superadmin) {
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    // Validasi email jika diubah
    if (email && email !== superadmin.email) {
      const existingEmail = await Superadmin.findOne({
        where: { email },
      });

      if (existingEmail && existingEmail.id !== superadminId) {
        return res.status(400).json({
          status: "error",
          message: "Email sudah digunakan oleh superadmin lain",
        });
      }
    }

    // Update data
    await superadmin.update({
      first_name: first_name || superadmin.first_name,
      last_name: last_name || superadmin.last_name,
      email: email || superadmin.email,
      phone: phone || superadmin.phone,
    });

    res.status(200).json({
      status: "success",
      message: "Profil berhasil diperbarui",
      data: {
        id: superadmin.id,
        username: superadmin.username,
        first_name: superadmin.first_name,
        last_name: superadmin.last_name,
        email: superadmin.email,
        phone: superadmin.phone,
      },
    });
  } catch (error) {
    console.error("❌ Error update profile:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui profil",
      detail: error.message,
    });
  }
};

// ========================================
// 📸 UPLOAD PROFILE IMAGE
// ========================================
exports.uploadProfileImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message || "Gagal upload gambar",
      });
    }

    try {
      const superadminId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "File gambar tidak ditemukan",
        });
      }

      const superadmin = await Superadmin.findByPk(superadminId);

      if (!superadmin) {
        // Hapus file yang baru diupload jika user tidak ditemukan
        fs.unlinkSync(req.file.path);
        return res.status(404).json({
          status: "error",
          message: "Superadmin tidak ditemukan",
        });
      }

      // Hapus gambar lama jika ada
      if (superadmin.profile_image) {
        const oldImagePath = path.join(
          __dirname,
          "../../uploads/profile",
          superadmin.profile_image
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update dengan nama file baru
      await superadmin.update({
        profile_image: req.file.filename,
      });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const profileImageUrl = `${baseUrl}/uploads/profile/${req.file.filename}`;

      res.status(200).json({
        status: "success",
        message: "Foto profil berhasil diupload",
        data: {
          profile_image: req.file.filename,
          profile_image_url: profileImageUrl,
        },
      });
    } catch (error) {
      console.error("❌ Error upload profile image:", error);
      
      // Hapus file yang baru diupload jika terjadi error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        status: "error",
        message: "Gagal upload foto profil",
        detail: error.message,
      });
    }
  });
};

// ========================================
// 🗑️ DELETE PROFILE IMAGE
// ========================================
exports.deleteProfileImage = async (req, res) => {
  try {
    const superadminId = req.user.id;

    const superadmin = await Superadmin.findByPk(superadminId);

    if (!superadmin) {
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    if (!superadmin.profile_image) {
      return res.status(400).json({
        status: "error",
        message: "Tidak ada foto profil yang perlu dihapus",
      });
    }

    // Hapus file fisik
    const imagePath = path.join(
      __dirname,
      "../../uploads/profile",
      superadmin.profile_image
    );
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Update database
    await superadmin.update({
      profile_image: null,
    });

    res.status(200).json({
      status: "success",
      message: "Foto profil berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Error delete profile image:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus foto profil",
      detail: error.message,
    });
  }
};

// ========================================
// 🔐 CHANGE PASSWORD
// ========================================
exports.changePassword = async (req, res) => {
  try {
    const superadminId = req.user.id;
    const { old_password, new_password, confirm_password } = req.body;

    // Validasi input
    if (!old_password || !new_password || !confirm_password) {
      return res.status(400).json({
        status: "error",
        message: "Harap isi semua field password",
      });
    }

    // Cek password baru dan konfirmasi cocok
    if (new_password !== confirm_password) {
      return res.status(400).json({
        status: "error",
        message: "Password baru dan konfirmasi password tidak cocok",
      });
    }

    // Validasi panjang password
    if (new_password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal harus 6 karakter",
      });
    }

    // Cek password baru tidak sama dengan password lama
    if (old_password === new_password) {
      return res.status(400).json({
        status: "error",
        message: "Password baru tidak boleh sama dengan password lama",
      });
    }

    // Ambil data superadmin
    const superadmin = await Superadmin.findByPk(superadminId);

    if (!superadmin) {
      return res.status(404).json({
        status: "error",
        message: "Superadmin tidak ditemukan",
      });
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(
      old_password,
      superadmin.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Password lama tidak sesuai",
      });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await superadmin.update({
      password: hashedPassword,
    });

    res.status(200).json({
      status: "success",
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("❌ Error change password:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengubah password",
      detail: error.message,
    });
  }
};