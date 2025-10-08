const express = require('express');
const { protect } = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');
const { body, validationResult } = require('express-validator');
const BaseUser = require('../models/User');
const Pro = require('../models/Pro');
const Client = require('../models/Client');


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
      const currentUser = await BaseUser.findById(req.user.id).select('+password');

      if (!currentUser) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      if (currentUser.role === role) {
        return res.json({
          message: 'Aucun changement',
          user: currentUser,
          token: generateToken(currentUser)
        });
      }

      // supprime ancien user et crée nouveau avec même id
      await BaseUser.deleteOne({ _id: currentUser._id });

      let newUser;
      if (role === 'pro') {
        newUser = await Pro.create({
          _id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          password: currentUser.password
        });
      } else {
        newUser = await Client.create({
          _id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          password: currentUser.password
        });
      }

      const token = generateToken(newUser);

      res.json({
        message: 'Rôle mis à jour',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        token
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

module.exports = router;
