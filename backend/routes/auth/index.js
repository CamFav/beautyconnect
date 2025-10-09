const express = require('express');
const router = express.Router();

router.use('/register', require('./register'));
router.use('/login', require('./login'));
router.use('/me', require('./me'));

module.exports = router;
