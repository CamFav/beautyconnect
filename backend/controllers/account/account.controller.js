const bcrypt = require("bcryptjs");
const sanitizeHtml = require("sanitize-html");
const BaseUser = require("../../models/User");
const { generateToken } = require("../../utils/jwt");
const cloudinary = require("../../config/cloudinary");
const {
  validateEmail,
  validatePassword,
  validateName,
  validationMessages,
} = require("../../utils/validators");

// ========================================
// PATCH /api/account/role
// ========================================
const updateRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.body;

    if (!["pro", "client"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    const user = await BaseUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // S'assurer que location est un objet
    if (typeof user.location !== "object" || Array.isArray(user.location)) {
      user.location = {
        city: "",
        country: "",
        latitude: null,
        longitude: null,
      };
    }

    user.activeRole = role;
    await user.save();

    const token = generateToken({
      id: user._id,
      email: user.email,
      activeRole: user.activeRole,
    });

    res.json({
      message: "Rôle mis à jour",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        activeRole: user.activeRole,
        avatarClient: user.avatarClient,
        avatarPro: user.avatarPro,
        proProfile: user.proProfile || null,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (err) {
    console.error("Erreur updateRole:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ========================================
// PATCH /api/account/profile
// ========================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, location } = req.body;

    const user = await BaseUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // --- Validation Nom, Email & Téléphone ---
    if (name && !validateName(name)) {
      return res.status(400).json({
        errors: [
          {
            field: "name",
            message: validationMessages.name,
          },
        ],
      });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({
        errors: [{ field: "email", message: validationMessages.email }],
      });
    }

    const phoneRegex = /^(?:\+?\d{1,3}\s?)?(?:\d{6,14})$/;
    if (phone && !phoneRegex.test(phone.replace(/\s/g, ""))) {
      return res.status(400).json({
        errors: [{ field: "phone", message: "Numéro de téléphone invalide." }],
      });
    }

    // --- Mise à jour ---
    if (typeof user.location !== "object" || Array.isArray(user.location)) {
      user.location = {
        city: "",
        country: "",
        latitude: null,
        longitude: null,
      };
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.trim();
    if (phone !== undefined) user.phone = phone.replace(/\s/g, "");

    if (location) {
      const { city, country, address, latitude, longitude } = location;
      user.location = {
        city: city || user.location?.city || "",
        country: country || user.location?.country || "",
        latitude: latitude ?? user.location?.latitude ?? null,
        longitude: longitude ?? user.location?.longitude ?? null,
      };
      // Optionnel: si pro, synchroniser la localisation pro pour l'affichage public
      if (user.activeRole === "pro" && user.proProfile) {
        user.proProfile.location = {
          city: user.location.city || "",
          country: user.location.country || "",
          address: user.location.address || "",
          latitude: user.location.latitude ?? null,
          longitude: user.location.longitude ?? null,
        };
      }
    }

    await user.save();

    res.json({
      message: "Profil client mis à jour",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        activeRole: user.activeRole,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ========================================
// PATCH /api/account/pro-profile
// ========================================
const updateProProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      businessName,
      status,
      exerciseType,
      services,
      location,
      siret,
      experience,
      categories,
    } = req.body;

    const user = await BaseUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (!user.proProfile) {
      user.proProfile = {};
    }

    // --- VALIDATIONS ---
    if (businessName && !validateName(businessName)) {
      return res.status(400).json({
        errors: [
          {
            field: "businessName",
            message:
              "Le nom du commerce doit contenir entre 2 et 60 caractères et peut inclure lettres, chiffres, espaces, tirets ou &",
          },
        ],
      });
    }

    if (siret && !/^\d{14}$/.test(siret)) {
      return res.status(400).json({
        errors: [
          {
            field: "siret",
            message: "Le numéro SIRET doit contenir 14 chiffres.",
          },
        ],
      });
    }

    if (status && !["salon", "freelance"].includes(status)) {
      return res.status(400).json({
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
        errors: [
          {
            field: "experience",
            message:
              "L'expérience doit être parmi : <1 an, 1 an, 2+ ans, 5+ ans.",
          },
        ],
      });
    }

    if (location) {
      if (!location.city || !location.country) {
        return res.status(400).json({
          errors: [
            {
              field: "location",
              message:
                "Les champs 'city' et 'country' sont requis pour la localisation.",
            },
          ],
        });
      }
    }

    if (categories) {
      const validCats = ["Coiffure", "Esthétique", "Tatouage", "Maquillage"];
      const catsToCheck = Array.isArray(categories) ? categories : [categories];
      const invalid = catsToCheck.filter((c) => !validCats.includes(c));
      if (invalid.length > 0) {
        return res.status(400).json({
          errors: [
            {
              field: "categories",
              message: `Catégories invalides : ${invalid.join(", ")}`,
            },
          ],
        });
      }
    }

    // --- MISE À JOUR ---
    if (businessName !== undefined) {
      user.proProfile.businessName = sanitizeHtml(businessName, {
        allowedTags: [],
        allowedAttributes: {},
      }).trim();
    }
    if (siret !== undefined) user.proProfile.siret = siret;
    if (experience !== undefined) user.proProfile.experience = experience;
    if (status !== undefined) user.proProfile.status = status;
    if (Array.isArray(exerciseType))
      user.proProfile.exerciseType = exerciseType;
    if (Array.isArray(services)) user.proProfile.services = services;
    if (Array.isArray(categories)) {
      user.proProfile.categories = categories;
    } else if (typeof categories === "string" && categories.length > 0) {
      user.proProfile.categories = [categories];
    }

    if (location) {
      if (!location.city || !location.country) {
        return res.status(400).json({
          errors: [
            {
              field: "location",
              message: "Les champs 'city' et 'country' sont requis.",
            },
          ],
        });
      }

      if (
        (status || user.proProfile.status) === "salon" &&
        !location.address?.trim()
      ) {
        return res.status(400).json({
          errors: [
            {
              field: "location.address",
              message: "L'adresse complète est obligatoire pour un salon.",
            },
          ],
        });
      }

      const { city, country, address, label, latitude, longitude } = location;
      user.proProfile.location = {
        address: address || label || user.proProfile?.location?.address || "",
        city: city || user.proProfile?.location?.city || "",
        country: country || user.proProfile?.location?.country || "France",
        latitude: latitude ?? user.proProfile?.location?.latitude ?? null,
        longitude: longitude ?? user.proProfile?.location?.longitude ?? null,
      };
    }

    user.role = "pro";
    user.activeRole = "pro";

    await user.save();

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      activeRole: user.activeRole,
    });

    res.json({
      message: "Profil professionnel mis à jour & rôle activé",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        activeRole: user.activeRole,
        proProfile: user.proProfile,
      },
      token,
    });
  } catch (err) {
    console.error("Erreur updateProProfile :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ========================================
// PATCH /api/account/pro/header
// ========================================
const updateProHeaderImage = async (req, res) => {
  try {
    // Vérifie qu'un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    // Récupère l'utilisateur
    const userId = req.user.id;
    const user = await BaseUser.findById(userId);

    // Vérifie que l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (!user.proProfile) {
      user.proProfile = {};
    }

    // Upload vers Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "headers" },
      async (error, result) => {
        if (error) {
          console.error("Erreur Cloudinary:", error);
          return res
            .status(500)
            .json({ message: "Erreur upload image cloudinary" });
        }

        // Met à jour le profil pro avec l'URL de l'image
        user.proProfile.headerImage = result.secure_url;
        await user.save();

        return res.json({
          message: "Header image mise à jour",
          headerImage: user.proProfile.headerImage,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ========================================
// PATCH /api/account/password
// ========================================
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        errors: [{ field: "newPassword", message: "Champs manquants." }],
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        errors: [
          {
            field: "newPassword",
            message: validationMessages.password,
          },
        ],
      });
    }

    const user = await BaseUser.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        errors: [{ field: "account", message: "Utilisateur introuvable." }],
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        errors: [
          {
            field: "currentPassword",
            message: "Mot de passe actuel incorrect.",
          },
        ],
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    console.error("Erreur changement mot de passe :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ========================================
// DELETE /api/account/delete
// ========================================
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await BaseUser.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    await BaseUser.findByIdAndDelete(userId);

    res.json({ message: "Compte supprimé avec succès." });
  } catch (err) {
    console.error("Erreur suppression de compte :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = {
  updateRole,
  updateProfile,
  updateProProfile,
  updateProHeaderImage,
  updatePassword,
  deleteAccount,
};

