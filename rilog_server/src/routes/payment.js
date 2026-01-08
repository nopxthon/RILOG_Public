const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController'); // ✅ Import Controller yang Tadi
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- MULTER CONFIG ---
const uploadDir = path.join(__dirname, '../../uploads/payments');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'PAY-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan!'));
    }
};
const upload = multer({ storage: storage });

// --- ROUTES USER ---
// 1. User Upload
router.post('/create', authMiddleware, upload.single('bukti_pembayaran'), paymentController.createPayment);
// 2. User History
router.get('/history', authMiddleware, paymentController.getMyPayments);

// --- ROUTES SUPERADMIN ---
// 3. Admin Lihat Semua (GET /api/payment/all)
router.get('/all', authMiddleware, paymentController.getAllPayments);

// 4. Admin Verifikasi (PUT /api/payment/process/:id)
// Saya pakai PUT sesuai request frontend terakhir
router.put('/process/:id', authMiddleware, paymentController.verifyPayment);

router.get('/my-subscription', authMiddleware, paymentController.getMySubscription);

module.exports = router;