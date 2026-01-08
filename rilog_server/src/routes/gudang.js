const express = require("express");
const router = express.Router();
const gudangController = require("../controllers/gudangController");
const authMiddleware = require("../middlewares/authMiddleware");
const { checkSubscriptionActive } = require('../middlewares/subscriptionMiddleware');

// Semua endpoint harus login
router.use(authMiddleware);

router.get("/", gudangController.getAllGudang);
router.post("/", gudangController.createGudang);
router.put("/:id", gudangController.updateGudang);
router.delete("/:id", gudangController.deleteGudang);

// 🔥 TAMBAHKAN BARIS INI (Wajib ada agar fitur aktivasi berfungsi) 🔥
router.patch("/:id/status", checkSubscriptionActive, gudangController.toggleStatusGudang);

module.exports = router;