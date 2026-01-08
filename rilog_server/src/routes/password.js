// src/routes/password.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { changePassword } = require("../controllers/passwordController");

/**
 * @route   PUT /api/password/change
 * @desc    Ubah kata sandi user
 * @access  Private
 */
router.put("/change", authMiddleware, changePassword);

module.exports = router;