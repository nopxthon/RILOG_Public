// src/routes/superadminDataPengguna.routes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getProfile,
  updateProfile,
  getAllSuperadmins,
  deleteProfileData,
} = require("../controllers/superadminDataPenggunaController");

/**
 * 🔐 Semua route ini memerlukan authentication sebagai superadmin
 */

// ========================================
// 📝 GET PROFILE
// ========================================
/**
 * @route   GET /api/superadmin/profile
 * @desc    Mendapatkan data profil superadmin yang sedang login
 * @access  Private (Superadmin only)
 */
router.get(
  "/profile",
  authMiddleware,
  authMiddleware.checkRole(["superadmin"]),
  getProfile
);

// ========================================
// ✏️ UPDATE PROFILE
// ========================================
/**
 * @route   PUT /api/superadmin/profile
 * @desc    Mengupdate data profil superadmin
 * @access  Private (Superadmin only)
 * @body    { first_name, last_name, email, phone }
 */
router.put(
  "/profile",
  authMiddleware,
  authMiddleware.checkRole(["superadmin"]),
  updateProfile
);

// ========================================
// 🔍 GET ALL SUPERADMINS (Optional)
// ========================================
/**
 * @route   GET /api/superadmin/list
 * @desc    Mendapatkan daftar semua superadmin (untuk management)
 * @access  Private (Superadmin only)
 * @query   search, page, limit
 */
router.get(
  "/list",
  authMiddleware,
  authMiddleware.checkRole(["superadmin"]),
  getAllSuperadmins
);

// ========================================
// 🗑️ DELETE PROFILE DATA (Optional)
// ========================================
/**
 * @route   DELETE /api/superadmin/profile/:field
 * @desc    Menghapus field tertentu dari profil (email atau phone)
 * @access  Private (Superadmin only)
 * @params  field (email | phone)
 */
router.delete(
  "/profile/:field",
  authMiddleware,
  authMiddleware.checkRole(["superadmin"]),
  deleteProfileData
);

module.exports = router;