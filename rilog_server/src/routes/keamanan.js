// src/routes/superadminProfile.js
const express = require("express");
const router = express.Router();
const superadminProfileController = require("../controllers/superadminKeamanan");
const authMiddleware = require("../middlewares/authMiddleware");

// ========================================
// 🔐 Semua route harus login sebagai superadmin
// ========================================

// GET Profile
router.get(
  "/profile",
  authMiddleware,
  authMiddleware.checkRole(["superadmin"]),
  superadminProfileController.getProfile
);

// UPDATE Profile (data text)
router.put(
  "/profile",
  authMiddleware,
  authMiddleware.checkRole(["superadmin"]),
  superadminProfileController.updateProfile
);

// UPLOAD Profile Image
router.post(
  "/profile/upload-image",
  authMiddleware,
  authMiddleware.checkRole(["superadmin"]),
  superadminProfileController.uploadProfileImage
);

// DELETE Profile Image
router.delete(
  "/profile/delete-image",
  authMiddleware,
  authMiddleware.checkRole(["superadmin"]),
  superadminProfileController.deleteProfileImage
);

// CHANGE Password
router.post(
  "/change-password",
  authMiddleware,
  authMiddleware.checkRole(["superadmin"]),
  superadminProfileController.changePassword
);

module.exports = router;