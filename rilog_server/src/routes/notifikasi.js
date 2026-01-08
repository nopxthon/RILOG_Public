const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const notifikasiController = require("../controllers/notifikasiController");

// 🔐 Semua route butuh autentikasi
router.use(authMiddleware);

// =====================
// NOTIFIKASI ROUTES
// =====================
router.post("/generate", notifikasiController.generateNotifikasi);
router.get("/", notifikasiController.getAllNotifikasi);
router.get("/summary", notifikasiController.getNotifikasiSummary);

router.delete("/:id", notifikasiController.deleteNotifikasi);
router.delete("/", notifikasiController.deleteAllNotifikasi);

// =====================
// MULTI GUDANG
// =====================
router.get(
  "/gudang/:gudang_id",
  notifikasiController.getNotifikasiByGudang
);

router.delete(
  "/gudang/:gudang_id",
  notifikasiController.deleteNotifikasiByGudang
);

router.get(
  "/gudang-list/count",
  notifikasiController.getGudangWithNotifikasiCount
);

module.exports = router;
