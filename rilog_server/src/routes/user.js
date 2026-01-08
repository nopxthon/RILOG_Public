// src/routes/user.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multer");
const userController = require("../controllers/userController");


// Get user profile
router.get("/profile", authMiddleware, userController.getProfile);

// Update user profile (tanpa foto)
router.put("/profile", authMiddleware, userController.updateProfile);

// Upload/Update foto profil
router.put(
  "/profile/photo",
  authMiddleware,
  upload.single("foto"),
  userController.uploadPhoto
);

// Delete foto profil
router.delete("/profile/photo", authMiddleware, userController.deletePhoto);

module.exports = router;