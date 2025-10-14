const express = require("express");
const { protect } = require("../../middleware/auth");
const {
  updateRole,
  updateProfile,
  updateProProfile,
} = require("../../controllers/account.controller");

const User = require("../../models/User");

const router = express.Router();

// Routes existantes
router.patch("/role", protect, updateRole);
router.patch("/profile", protect, updateProfile);
router.patch("/pro-profile", protect, updateProProfile);
router.patch("/upgrade-pro", protect, updateProProfile);

// Nouvelle route pour passer un user existant en PRO
router.put("/upgrade", protect, async (req, res) => {
  try {
    const userId = req.user.id; // récupéré via le JWT
    const {
      businessName,
      siret,
      services,
      status,
      exerciseType,
      experience,
      location,
    } = req.body;

    // Vérification user existant
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Mise à jour des champs
    user.role = "pro";
    user.activeRole = "pro";
    user.proProfile = {
      businessName: businessName || user.proProfile?.businessName || "",
      siret: siret || user.proProfile?.siret || "",
      services: services || user.proProfile?.services || [],
      status: status || user.proProfile?.status || "freelance",
      exerciseType: exerciseType || user.proProfile?.exerciseType || [],
      experience: experience || user.proProfile?.experience || "<1 an",
      location: location || user.proProfile?.location || "",
    };

    await user.save();

    res.json({
      message: "Utilisateur mis à niveau en PRO",
      user,
    });
  } catch (err) {
    console.error("Erreur upgrade:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
