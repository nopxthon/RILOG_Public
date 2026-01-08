'use strict';
const express = require('express');
const router = express.Router();

// Pastikan path ini mengarah ke file controller yang benar
const superadminAuthController = require('../controllers/superadminAuthController'); 
const authMiddleware = require('../middlewares/authMiddleware'); 

router.post('/login', superadminAuthController.login);

// 2. GET ME (Private - Butuh Token)
// Penting agar user tidak logout sendiri saat refresh halaman
router.get('/me', authMiddleware, superadminAuthController.getMe);

router.post('/logout', superadminAuthController.logout);


module.exports = router;