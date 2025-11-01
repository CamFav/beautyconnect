const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { protect } = require("../middleware/auth");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const {
  validateEmail,
  validatePassword,
  validateName,
} = require("../utils/validators");

// =======================
// Helper anti-injection
// =======================
const allowOnly = (allowedKeys, data) => {
  Object.keys(data).forEach((key) => {
    if (!allowedKeys.includes(key)) delete data[key];
  });
};

// ========================================
// POST /api/auth/register
// ========================================
router.post(
  "/register",
  [
    body("name")
      .trim()
      .custom((value) => {
        if (!validateName(value)) {
          throw new Error(
            "Nom invalide (2 à 60 caractères, lettres/chiffres autorisés)"
          );
        }
        return true;
      }),

    body("email")
      .trim()
      .custom((value) => {
        if (!validateEmail(value)) throw new Error("Adresse email invalide");
        return true;
      }),

    body("password")
      .trim()
      .custom((value) => {
        if (!validatePassword(value)) {
          throw new Error(
            "Mot de passe faible (min 8 caractères, majuscule, minuscule et chiffre requis)"
          );
        }
        return true;
      }),

    body("role").optional().isIn(["client", "pro"]),
    body("activeRole").optional().isIn(["client", "pro"]),
    body("proProfile.businessName").optional().trim().escape(),
    body("proProfile.siret").optional().trim().escape(),
  ],
  validate,
  async (req, res) => {
    const {
      name,
      email,
      password,
      role,
      activeRole,
      proProfile = {},
    } = req.body;
    allowOnly(
      ["name", "email", "password", "role", "activeRole", "proProfile"],
      req.body
    );

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          message: "Email déjà utilisé.",
          errors: [
            { field: "email", message: "Cet email est déjà enregistré." },
          ],
        });
      }

      const finalRole = role || activeRole || "client";

      const newUser = new User({
        name,
        email,
        password,
        role: finalRole,
        activeRole: finalRole,
        proProfile:
          finalRole === "pro"
            ? {
                businessName: proProfile.businessName || "",
                siret: proProfile.siret || "",
                status: proProfile.status || "freelance",
                exerciseType: Array.isArray(proProfile.exerciseType)
                  ? proProfile.exerciseType
                  : [],
                experience: proProfile.experience || "<1 an",
                categories: Array.isArray(proProfile.categories)
                  ? proProfile.categories
                  : [],
                services: proProfile.services || [],
                location: {
                  address: proProfile?.location?.address || "",
                  city: proProfile?.location?.city || "",
                  country: proProfile?.location?.country || "France",
                },
              }
            : undefined,
      });

      await newUser.save();

      return res.status(201).json({
        message: "Compte créé avec succès.",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          activeRole: newUser.activeRole,
        },
      });
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Erreur /register:", err);
      }
      return res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// ========================================
// POST /api/auth/login
// ========================================
router.post(
  "/login",
  [
    body("email")
      .trim()
      .custom((value) => {
        if (!validateEmail(value)) throw new Error("Adresse email invalide");
        return true;
      }),
    body("password").trim().notEmpty().withMessage("Mot de passe requis"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).json({
          message: "Identifiants invalides.",
          errors: [{ field: "email", message: "Utilisateur introuvable." }],
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Identifiants invalides.",
          errors: [{ field: "password", message: "Mot de passe incorrect." }],
        });
      }

      const token = generateToken(user);

      res.json({
        message: "Connexion réussie.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          activeRole: user.activeRole,
          proProfile: user.proProfile,
        },
      });
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Erreur /login:", err);
      }
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// ========================================
// GET /api/auth/me
// ========================================
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.json(user);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur /auth/me:", err);
    }
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
