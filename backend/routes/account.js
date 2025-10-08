const express = require('express');
const { protect } = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

/**
 * PATCH : /api/account/role
 * body: { role: "client" | "pro" }
 * Retourne l'utilisateur MAJ + nouveau token
 */
router.patch(
  '/role',
  protect,
  [
    body('role')
      .trim()
      .escape()
      .notEmpty().withMessage('Le rôle est requis')
      .isIn(['client', 'pro']).withMessage('Rôle invalide'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { role } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.sub,
        { role },
        { new: true, runValidators: true, select: '-password' }
      );

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      const token = generateToken(user);

      res.json({
        message: 'Rôle mis à jour',
        user,
        token,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

module.exports = router;
