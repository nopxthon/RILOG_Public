const router = require('express').Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware'); // Import file tadi

// 1. Pasang Auth dulu (Wajib Login)
router.use(authMiddleware);

// 2. Pasang Role sesuai kebutuhan
// Staff & Admin boleh LIHAT (GET)
router.get('/', roleMiddleware.verifyToken(['admin', 'staff']), itemController.getItemsByGudang);

// HANYA Admin boleh TAMBAH, EDIT, HAPUS
router.post('/', roleMiddleware.verifyToken(['admin']), itemController.createItem);
router.put('/:id', roleMiddleware.verifyToken(['admin']), itemController.updateItem);
router.delete('/:id', roleMiddleware.verifyToken(['admin']), itemController.deleteItem);

module.exports = router;