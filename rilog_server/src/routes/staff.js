const express = require("express");
const router = express.Router();
const StaffController = require("../controllers/StaffController");
const authMiddleware = require("../middlewares/authMiddleware");
const { checkSubscriptionActive } = require('../middlewares/subscriptionMiddleware');

// Semua route staff harus pakai authMiddleware
router.post("/invite", authMiddleware, StaffController.inviteStaff);
router.post("/activate", StaffController.activateStaff);

router.get("/", authMiddleware, StaffController.getAllStaff);
router.get("/validate-token", StaffController.validateToken);

router.put("/update-access", authMiddleware, StaffController.updateAccess);
router.patch("/:id/status", authMiddleware,checkSubscriptionActive, StaffController.toggleStatusStaff);

// ⭐ ROUTE DELETE STAFF (baru)
router.delete("/:id", authMiddleware, StaffController.deleteStaff);

module.exports = router;
