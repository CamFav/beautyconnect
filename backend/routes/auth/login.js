const express = require('express');
const User = require('../../models/User');
const { generateToken } = require('../../utils/jwt');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/* POST /api/auth/login */
router.post(
  '/',
  [
    body('email')
      .trim()
      .normalizeEmail()
      .notEmpty().withMessage('Email requis')
      .isEmail().withMessage('Email invalide'),

    body('password')
      .trim()
      .notEmpty().withMessage('Mot de passe requis'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ message: 'Utilisateur introuvable' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }

      const token = generateToken(user);

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          activeRole: user.activeRole,
          proProfile: user.proProfile
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

module.exports = router;
