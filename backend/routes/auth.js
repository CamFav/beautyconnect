const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');
const router = express.Router();

/* ROUTE : POST /api/auth/register
Inscrire un nouvel utilisateur */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Vérifie si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Crée un nouvel utilisateur et le sauvegarde
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    // Réponse sans le mot de passe
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
});

/* ROUTE : POST /api/auth/login
   Authentification
*/
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Recherche de l'utilisateur
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur introuvable' });
    }

    // Vérifie la correspondance du mot de passe (compare hash / clair)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Génère un token (identité + rôle)
    const token = generateToken({ id: user._id, role: user.role });

    // Réponse au client
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
});



/* ROUTE : GET /api/auth/me
   Récupére le profil de l'utilisateur connecté
   */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
