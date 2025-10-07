const express = require('express');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

// GET /api/pro/dashboard - réservé à role pro
router.get('/dashboard', protect, requireRole('pro'), (req, res) => {
  res.json({ status: 'ok', message: 'Bienvenue sur le dashboard PRO' });
});

module.exports = router;
