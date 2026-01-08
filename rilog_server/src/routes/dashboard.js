// src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware'); // Sesuaikan path middleware auth Anda

// GET /api/dashboard
// Menambahkan authMiddleware agar hanya user login yang bisa lihat dashboard
router.get('/', authMiddleware, getDashboardStats);

module.exports = router;