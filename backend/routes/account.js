const express = require('express');
const { protect } = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');
const User = require('../models/User');

const router = express.Router();

/**
 * PATCH : /api/account/role
 * body: client | pro }
 * Retourne l'utilisateur MAJ + nouveau token
 */
router.patch('/role', protect, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['client', 'pro'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role },
      { new: true, runValidators: true, select: '-password' }
    );

    const token = generateToken({ id: user._id, role: user.role });
    res.json({ message: 'Rôle mis à jour', user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
