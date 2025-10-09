const express = require('express');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { getDashboard } = require('../controllers/proController');

const router = express.Router();

// GET /api/pro/dashboard - réservé à role pro
router.get('/dashboard', protect, requireRole('pro'), getDashboard);

module.exports = router;
