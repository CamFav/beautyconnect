const express = require('express');
const { protect } = require('../middleware/auth');
const BaseUser = require('../models/User');
const { generateToken } = require('../utils/jwt');

const router = express.Router();

/**
 * PATCH : /api/account/role
 * body: { role: "client" | "pro" }
 * Met à jour activeRole sans toucher aux données de base
 */
router.patch('/role', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.body;

    if (!['pro', 'client'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    // Récupération
    const user = await BaseUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // On change seulement activeRole
    user.activeRole = role;
    await user.save();

    // On régénère un token avec activeRole
    const token = generateToken({
      id: user._id,
      email: user.email,
      activeRole: user.activeRole
    });

    res.json({
      message: 'Rôle mis à jour',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        activeRole: user.activeRole
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PATCH /api/account/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, location } = req.body;

    const user = await BaseUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;

    await user.save();

    res.json({
      message: 'Profil client mis à jour',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        activeRole: user.activeRole
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PATCH /api/account/pro-profile
router.patch('/pro-profile', protect, async (req, res) => {
console.log("✅ PATCH /api/account/pro-profile appelé");
console.log("Body reçu :", req.body);
  try {
    const userId = req.user.id;
    const {
      businessName,
      status,
      exerciseType,
      services,
      location,
      siret
    } = req.body;

    const user = await BaseUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (!user.proProfile) {
      user.proProfile = {};
    }

    if (businessName !== undefined) user.proProfile.businessName = businessName;
    if (status !== undefined) user.proProfile.status = status;
    if (Array.isArray(exerciseType)) user.proProfile.exerciseType = exerciseType;
    if (Array.isArray(services)) user.proProfile.services = services;
    if (location !== undefined) user.proProfile.location = location;
    if (siret !== undefined) user.proProfile.siret = siret;

    await user.save();

    res.json({
      message: 'Profil professionnel mis à jour',
      proProfile: user.proProfile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
