// src/controllers/userController.js
const { User, Bisnis, Sub_plan } = require("../models"); // ✅ Pastikan Sub_plan diimport
const path = require("path");
const fs = require("fs");

// ========== Helper: Validasi Path (Keamanan) ==========
const isValidPhotoPath = (photoPath, uploadsDir) => {
  const normalizedPath = path.normalize(photoPath);
  const normalizedUploadsDir = path.normalize(uploadsDir);
  return normalizedPath.startsWith(normalizedUploadsDir);
};

// ========== Helper: Hapus File Foto ==========
const deletePhotoFile = (fotoUrl, uploadsDir) => {
  if (!fotoUrl) return;

  try {
    const photoPath = path.join(uploadsDir, path.basename(fotoUrl));

    // Cek keamanan path
    if (!isValidPhotoPath(photoPath, uploadsDir)) {
      console.warn("⚠️ Invalid photo path detected:", photoPath);
      return;
    }

    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
      console.log("✅ Foto dihapus:", photoPath);
    }
  } catch (err) {
    console.error("⚠️ Gagal hapus foto:", err.message);
  }
};

// ========== Get user profile (DIPERBARUI) ==========
exports.getProfile = async (req, res) => {
  try {
    // 🔥 Ambil User + Bisnis + Sub Plan (Termasuk Limit)
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "deleted_at"] },
      include: [
        {
          model: Bisnis,
          as: "bisnis",
          attributes: [
            "id", 
            "nama_bisnis", 
            "tipe_bisnis", 
            "sub_status", // ✅ Status langganan
            "sub_start",  // ✅ Tanggal mulai
            "sub_end"     // ✅ Tanggal berakhir
          ],
          include: [
            {
              model: Sub_plan,
              as: "subPlan",
              // 🔥 UPDATE PENTING: Ambil data limit dari database
              attributes: ["nama_paket", "tipe", "limit_gudang", "limit_staff"] 
            }
          ]
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    // Buat full URL untuk foto
    let foto_url = user.foto_profil;
    if (foto_url && !foto_url.startsWith('http')) {
      foto_url = `${req.protocol}://${req.get('host')}${foto_url}`;
    }

    // 🔥 FORMAT DATA UNTUK FRONTEND
    res.status(200).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        foto_profil: user.foto_profil, // Path relatif
        foto_url: foto_url,            // Full URL
        
        // Data Bisnis
        bisnis_id: user.bisnis?.id || null,
        nama_bisnis: user.bisnis?.nama_bisnis || null,
        tipe_bisnis: user.bisnis?.tipe_bisnis || null,

        // ✅ DATA LANGGANAN
        sub_status: user.bisnis?.sub_status || 'inactive',
        sub_start: user.bisnis?.sub_start || null,
        sub_end: user.bisnis?.sub_end || null,
        
        // Info Paket
        nama_paket: user.bisnis?.subPlan?.nama_paket || 'Basic',
        tipe_paket: user.bisnis?.subPlan?.tipe || null,

        // 🔥 DATA LIMIT (Dikirim ke Frontend)
        // Jika data null (misal belum ada paket), beri default minimal
        limit_gudang: user.bisnis?.subPlan?.limit_gudang || 1, 
        limit_staff: user.bisnis?.subPlan?.limit_staff || 1,
      },
    });
  } catch (error) {
    console.error("❌ Error get profile:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil profil",
      detail: error.message,
    });
  }
};

// ========== Update user profile (tanpa foto) ==========
exports.updateProfile = async (req, res) => {
  try {
    const { name, nama_bisnis, tipe_bisnis } = req.body;
    const user = req.userInstance; // Dari middleware

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    // Update user
    if (name) user.name = name;

    // Update bisnis jika ada
    if (user.bisnis_id && (nama_bisnis || tipe_bisnis)) {
      const bisnis = await Bisnis.findByPk(user.bisnis_id);
      if (bisnis) {
        if (nama_bisnis) bisnis.nama_bisnis = nama_bisnis;
        if (tipe_bisnis) bisnis.tipe_bisnis = tipe_bisnis;
        await bisnis.save();
      }
    }

    await user.save();

    // Buat full URL
    let foto_url = user.foto_profil;
    if (foto_url && !foto_url.startsWith('http')) {
      foto_url = `${req.protocol}://${req.get('host')}${foto_url}`;
    }

    res.status(200).json({
      status: "success",
      message: "Profil berhasil diperbarui",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        foto_profil: user.foto_profil,
        foto_url: foto_url,
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

// ========== Upload foto profil (TETAP SAMA) ==========
exports.uploadPhoto = async (req, res) => {
  const uploadsDir = path.join(__dirname, "../../uploads/profile");

  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "File foto tidak ditemukan",
      });
    }

    // Validasi MIME type
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        status: "error",
        message: "Tipe file tidak valid. Hanya JPG, PNG, dan GIF yang diperbolehkan",
      });
    }

    // Validasi ukuran file (2MB)
    if (req.file.size > 2 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        status: "error",
        message: "Ukuran file terlalu besar. Maksimal 2MB",
      });
    }

    const user = req.userInstance;

    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    // Hapus foto lama
    if (user.foto_profil) {
      deletePhotoFile(user.foto_profil, uploadsDir);
    }

    // Update database
    const fotoPath = `/uploads/profile/${req.file.filename}`;
    user.foto_profil = fotoPath;
    await user.save();

    const fotoUrl = `${req.protocol}://${req.get('host')}${fotoPath}`;

    res.status(200).json({
      status: "success",
      message: "Foto profil berhasil diupload",
      data: {
        foto_url: fotoUrl,
        foto_profil: fotoPath,
      },
    });
  } catch (error) {
    console.error("❌ Error upload photo:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({
      status: "error",
      message: "Gagal mengupload foto",
      detail: error.message,
    });
  }
};

// ========== Delete foto profil (TETAP SAMA) ==========
exports.deletePhoto = async (req, res) => {
  const uploadsDir = path.join(__dirname, "../../uploads/profile");

  try {
    const user = req.userInstance;

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    if (!user.foto_profil) {
      return res.status(400).json({
        status: "error",
        message: "Tidak ada foto profil yang dapat dihapus",
      });
    }

    deletePhotoFile(user.foto_profil, uploadsDir);

    user.foto_profil = null;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Foto profil berhasil dihapus",
      data: {
        foto_url: null,
        foto_profil: null
      }
    });
  } catch (error) {
    console.error("❌ Error delete photo:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus foto",
      detail: error.message,
    });
  }
};