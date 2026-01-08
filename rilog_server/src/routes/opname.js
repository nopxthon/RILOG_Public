// src/routes/opname.js

const express = require('express');
const router = express.Router();
const authMiddleware  = require('../middlewares/authMiddleware'); 
const opnameController = require('../controllers/stokOpnameController'); 

// Baris 8
router.get('/stok-opname', authMiddleware, opnameController.getOpnameHistory); 
// Baris 9
router.post('/stok-opname/batch', authMiddleware, opnameController.createOpnameBatch); 
// Baris 10 (Diduga penyebab error)
router.get('/batches', authMiddleware, opnameController.getBatchesByGudang); // ✅ PASTIKAN DI SINI TIDAK ADA SALAH KETIK

module.exports = router;