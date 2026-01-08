const express = require("express");
const router = express.Router();
const superadminProfileController = require("../controllers/superadminProfileController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

// Semua route memerlukan autentikasi superadmin
router.use(authMiddleware);
router.use(authMiddleware.checkRole(["superadmin"]));

// Get profile
router.get("/profile", superadminProfileController.getProfile);

// Update profile data
router.put("/profile", superadminProfileController.updateProfile);

// Upload profile image
router.post(
  "/profile/image",
  upload.single("profile_image"),
  superadminProfileController.uploadProfileImage
);

// Delete profile image
router.delete("/profile/image", superadminProfileController.deleteProfileImage);

module.exports = router;