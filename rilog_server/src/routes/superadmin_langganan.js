const express = require('express');
const router = express.Router();
// Pastikan path controller ini BENAR sesuai lokasi file Anda
const DashboardController = require('../controllers/superadminLanggananController'); 
const authMiddleware = require('../middlewares/authMiddleware'); // Cek apakah folder 'middleware' atau 'middlewares'

// Middleware Auth
router.use(authMiddleware);
router.use(authMiddleware.checkRole(['superadmin'])); 

// ==========================================
// 1. Manajemen Pengguna
// ==========================================
router.get('/users', DashboardController.getUsers);
router.delete('/users/:id', DashboardController.deleteUser);

// 🔥 TAMBAHAN PENTING: Route untuk Edit Status 🔥
router.put('/users/:id', DashboardController.updateUserStatus); 


router.get('/logs', DashboardController.getLogs);

module.exports = router;