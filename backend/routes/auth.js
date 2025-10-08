const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const router = express.Router();

/* ROUTE : POST /api/auth/register
Inscrire un nouvel utilisateur */
router.post(
  '/register',
  [
  body('name')
    .trim()
    .escape()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),

  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage("L'email est requis")
    .isEmail().withMessage("L'email est invalide"),

  body('password')
    .trim()
    .escape()
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),

  body('role')
    .optional()
    .trim()
    .escape()
    .isIn(['client', 'pro']).withMessage("Le rôle doit être 'client' ou 'pro'"),
],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }

      const newUser = new User({ name, email, password, role });
      await newUser.save();

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

/* ROUTE : POST /api/auth/login
   Authentification
*/
router.post(
  '/login',
  [
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage('Email requis')
    .isEmail().withMessage('Email invalide'),

  body('password')
    .trim()
    .escape()
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
          role: user.role
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

/* ROUTE : GET /api/auth/me
   Récupère le profil de l'utilisateur connecté
*/
router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.sub) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    const user = await User.findById(req.user.sub).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
