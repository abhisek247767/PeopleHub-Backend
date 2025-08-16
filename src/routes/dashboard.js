const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');


// Project Routes

/**
 * @route GET /dashboard/stats
 * @desc Get all stats to display dashboard (no auth)
 * @access Public (Anyone)
 */
router.get('/dashboard/stats', authenticate(), DashboardController.getAllStats);


module.exports = router;
