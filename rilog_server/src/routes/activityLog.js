// routes/activityLogRoutes.js
const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const auth = require('../middlewares/authMiddleware.js');

// @route   GET /api/activity-logs
// @desc    Get activity logs by gudang
// @access  Private
router.get('/', auth, getActivityLogs);

module.exports = router;