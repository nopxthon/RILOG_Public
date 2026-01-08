'use strict';
const express = require('express');
const router = express.Router();
const subPlanController = require('../controllers/subPlanController');

// Import Middleware (Hanya Auth saja, CheckRole tidak dipakai)
const authMiddleware = require('../middlewares/authMiddleware');

// ==========================================
// 🔓 PUBLIC ROUTES
// ==========================================
router.get('/', subPlanController.getAllPlans); 

// ==========================================
// 🔒 ADMIN / SUPERADMIN ROUTES (Tanpa Check Role)
// ==========================================
// Catatan: Tetap pakai authMiddleware agar req.user terdeteksi

// 1. List Semua Paket (Termasuk yg Non-Aktif)
// PENTING: Route statis ini harus diletakkan SEBELUM route dinamis /:id
router.get('/superadmin/all', 
  (req, res, next) => {
      console.log(">>> CEKPOINT: Request masuk ke route /superadmin/all");
      next(); // Lanjut ke middleware berikutnya
  },
  authMiddleware, 
  subPlanController.getAdminPlans
);

// 2. Tambah Paket Baru
router.post('/', 
  authMiddleware, 
  subPlanController.createPlan
);

// 3. Update Status ON/OFF (Switch)
router.patch('/:id/status', 
  authMiddleware, 
  subPlanController.updatePlanStatus
);

// 4. Update Detail Paket (Full Edit)
router.put('/:id', 
  authMiddleware, 
  subPlanController.updatePlan
);

// 5. Hapus Paket
router.delete('/:id', 
  authMiddleware, 
  subPlanController.deletePlan
);

// 6. Detail Paket by ID (Route Dinamis ditaruh paling bawah)
router.get('/:id', subPlanController.getPlanById);

module.exports = router;