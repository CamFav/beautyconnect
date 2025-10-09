const express = require('express');
const { protect } = require('../middleware/auth');
const {
  updateRole,
  updateProfile,
  updateProProfile
} = require('../controllers/account.controller');

const router = express.Router();

router.patch('/role', protect, updateRole);
router.patch('/profile', protect, updateProfile);
router.patch('/pro-profile', protect, updateProProfile);

module.exports = router;
