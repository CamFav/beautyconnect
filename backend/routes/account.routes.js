const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const upload = require("../middleware/upload");
const User = require("../models/User");
const { validateName, validationMessages } = require("../utils/validators");

const {
  updateRole,
  updateProfile,
  updateProProfile,
  updateProHeaderImage,
  updatePassword,
  deleteAccount,
} = require("../controllers/account/account.controller");

// contrôleur RGPD
const { exportUserData } = require("../controllers/account/export.controller");

// ========================================
// PATCH /api/account/role
// ========================================
router.patch("/role", protect, updateRole);

// ========================================
// PATCH /api/account/profile
// ========================================
router.patch("/profile", protect, updateProfile);

// ========================================
// PATCH /api/account/pro-profile
// ========================================
// Autorise les clients à utiliser /pro-profile pour effectuer l'upgrade vers PRO
router.patch("/pro-profile", protect, updateProProfile);

// ========================================
// PATCH /api/account/pro/header (upload bannière)
// ========================================
router.patch(
  "/pro/header",
  protect,
  upload.single("header"),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }
    next();
  },
  // Puis contrôle du rôle
  requireRole("pro"),

  updateProHeaderImage
);

// ========================================
// PATCH /api/account/password
// ========================================
router.patch("/password", protect, updatePassword);

// ========================================
// DELETE /api/account/delete
// ========================================
router.delete("/delete", protect, deleteAccount);

// ========================================
// GET /api/account/export
// ========================================
router.get("/export", protect, exportUserData);

// ========================================
// PUT /api/account/upgrade (client vers pro)
// ========================================
router.put("/upgrade", protect, requireRole("client"), async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      businessName,
      siret,
      services,
      status,
      exerciseType,
      experience,
      location,
      categories,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // === VALIDATIONS ===
    if (!validateName(businessName || "")) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: [
          {
            field: "businessName",
            message: validationMessages.name,
          },
        ],
      });
    }

    if (siret && !/^\d{14}$/.test(siret)) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: [
          { field: "siret", message: "Le SIRET doit contenir 14 chiffres." },
        ],
      });
    }

    if (!location?.city || !location?.country) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: [
          {
            field: "location",
            message: "Les champs city et country sont obligatoires.",
          },
        ],
      });
    }

    if (status === "salon" && !location.address?.trim()) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: [
          {
            field: "location.address",
            message: "L'adresse complète est requise pour un salon.",
          },
        ],
      });
    }

    if (status && !["salon", "freelance"].includes(status)) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: [
          {
            field: "status",
            message: "Le statut doit être 'salon' ou 'freelance'.",
          },
        ],
      });
    }

    if (
      experience &&
      !["<1 an", "1 an", "2+ ans", "5+ ans"].includes(experience)
    ) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: [
          {
            field: "experience",
            message:
              "L'expérience doit être parmi : <1 an, 1 an, 2+ ans, 5+ ans.",
          },
        ],
      });
    }

    // === MISE À JOUR ===
    user.role = "pro";
    user.activeRole = "pro";

    user.proProfile = {
      businessName: businessName || "",
      siret: siret || "",
      services: services || [],
      status: status || "freelance",
      exerciseType: exerciseType || [],
      experience: experience || "<1 an",
      categories: Array.isArray(categories) ? categories : [],
      location: {
        city: location.city,
        country: location.country,
        address: location.address || "",
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
      },
    };

    await user.save();

    return res.json({ message: "Compte mis à niveau vers PRO", user });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur upgrade:", err);
    }
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
