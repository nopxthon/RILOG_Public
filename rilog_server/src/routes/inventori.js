const express = require('express');
const router = express.Router();
const inventoriController = require('../controllers/inventoriController');

// 1. Import Middleware
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// 2. Pasang Auth Middleware (Wajib Login)
router.use(authMiddleware);

// 3. Pasang Role Middleware (Hanya Admin & Staff yang boleh akses inventori)
// Kita pasang di level router.use() agar berlaku untuk semua route di bawahnya
// karena Admin dan Staff memiliki hak yang sama untuk kelola stok fisik.
router.use(roleMiddleware.verifyToken(['admin', 'staff']));

/**
 * @route   GET /api/inventori/
 * @desc    [Tab 1] Mengambil Data Inventori
 */
router.get('/', inventoriController.getDataInventori);

/**
 * @route   GET /api/inventori/histori
 * @desc    [Tab 2 & 3] Mengambil Riwayat Stok
 */
router.get('/histori', inventoriController.getHistoriTransaksi);

/**
 * @route   GET /api/inventori/kadaluarsa
 * @desc    [Tab 4] Mengambil data Kadaluarsa
 */
router.get('/kadaluarsa', inventoriController.getKadaluarsa);

/**
 * @route   POST /api/inventori/stok-masuk
 * @desc    [Modal] Menambah Stok Masuk
 */
router.post('/stok-masuk', inventoriController.handleStokMasuk);

/**
 * @route   POST /api/inventori/stok-keluar
 * @desc    [Modal] Mengeluarkan Stok (FEFO)
 */
router.post('/stok-keluar', inventoriController.handleStokKeluar);

/**
 * @route   PUT /api/inventori/stok-masuk/:id
 * @desc    [Modal Edit] Mengubah Data Stok Masuk (Info Only)
 */
router.put('/stok-masuk/:id', inventoriController.updateStokMasuk);

/**
 * @route   PUT /api/inventori/stok-keluar/:id
 * @desc    [Modal Edit] Mengubah Data Stok Keluar (Info Only)
 */
router.put('/stok-keluar/:id', inventoriController.updateStokKeluar);

module.exports = router;