const express = require('express');
const router = express.Router(); // ✅ Ini yang kurang (Inisialisasi Router)

// Import Controller
const { getLaporanInventaris, getGrafikStok } = require('../controllers/laporanController');

// Import Middleware (Sesuaikan path jika berbeda, biasanya di ../middleware/authMiddleware)
const authMiddleware = require('../middlewares/authMiddleware'); 

// ===========================
// DEFINISI ROUTES
// ===========================

// Route: GET /api/laporan
// Kita pakai '/' karena di server.js sudah didefinisikan app.use('/api/laporan', ...)
router.get('/', authMiddleware, getLaporanInventaris); 
router.get('/grafik', authMiddleware, getGrafikStok);

module.exports = router; // ✅ Wajib di-export agar bisa dibaca server.js