const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');

const router = express.Router();

/* POST /api/auth/register */
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Le nom est requis')
      .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),

    body('email')
      .trim()
      .normalizeEmail()
      .notEmpty().withMessage("L'email est requis")
      .isEmail().withMessage("L'email est invalide"),

    body('password')
      .trim()
      .notEmpty().withMessage('Le mot de passe est requis')
      .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),

    body('activeRole')
      .optional()
      .isIn(['client', 'pro']).withMessage("Le rôle doit être 'client' ou 'pro'"),
  ],
  async (req, res) => {
    console.log("Requête reçue pour /register :", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        email,
        password,
        activeRole,
        proProfile = {}
      } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }

      const newUser = new User({
        name,
        email,
        password,
        activeRole: activeRole || 'client',
        proProfile: activeRole === 'pro' ? proProfile : undefined
      });

      await newUser.save();

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          activeRole: newUser.activeRole
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

module.exports = router;
