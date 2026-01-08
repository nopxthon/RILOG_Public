const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
// const { protect } = require('../middleware/authMiddleware');

// router.use(protect); // Lindungi rute

// HANYA mengizinkan GET /api/kategori/
router.route('/')
  .get(kategoriController.getAllKategori);

// Rute POST, PUT, DELETE dihapus karena user biasa tidak boleh melakukannya.

module.exports = router;