const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Liste tous les utilisateurs
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bloque la création d'user au mauvais lien
router.post('/', protect, (req, res) => {
  res.status(403).json({ message: "Création interdite" });
});

module.exports = router;
