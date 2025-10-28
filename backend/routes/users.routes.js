const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");

const User = require("../models/User");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const validate = require("../middleware/validate");

// Helper async
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ========================================
// GET /api/users/me/following
// ========================================
router.get(
  "/me/following",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("following");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json({
      message: "Liste des abonnements récupérée",
      following: user.following,
    });
  })
);

// ========================================
// GET /api/users?ids=1,2,3
// ========================================
router.get(
  "/",
  protect,
  [query("ids").notEmpty().withMessage("Aucun ID fourni")],
  validate,
  asyncHandler(async (req, res) => {
    const idsArray = req.query.ids.split(",");
    const users = await User.find({ _id: { $in: idsArray } }).select(
      "name avatarPro avatarClient proProfile"
    );
    res.json({ message: "Utilisateurs récupérés", users });
  })
);

// ========================================
// GET /api/users/getPros
// ========================================
router.get(
  "/getPros",
  asyncHandler(async (req, res) => {
    const { city, country } = req.query;
    const filter = { role: "pro", "proProfile.businessName": { $ne: "" } };

    if (city) filter["proProfile.location.city"] = city;
    if (country) filter["proProfile.location.country"] = country;

    const pros = await User.find(filter).select("-password").lean();
    res.json({ message: "Prestataires récupérés", pros });
  })
);

// ========================================
// POST /api/users/:id/follow
// ========================================
router.post(
  "/:id/follow",
  protect,
  [param("id").isMongoId().withMessage("ID utilisateur invalide")],
  validate,
  asyncHandler(async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    // Empêche de se suivre soi-même
    if (targetUserId === currentUserId) {
      return res
        .status(400)
        .json({ message: "Impossible de se suivre soi-même." });
    }

    try {
      const [targetUser, currentUser] = await Promise.all([
        User.findById(targetUserId),
        User.findById(currentUserId),
      ]);

      if (!targetUser)
        return res.status(404).json({ message: "Utilisateur introuvable." });

      const alreadyFollowing = currentUser.following.includes(targetUserId);

      if (alreadyFollowing) {
        // Désabonnement
        currentUser.following = currentUser.following.filter(
          (id) => id.toString() !== targetUserId
        );
        targetUser.followers = targetUser.followers.filter(
          (id) => id.toString() !== currentUserId
        );
      } else {
        // Abonnement
        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);
      }

      await Promise.all([currentUser.save(), targetUser.save()]);

      res.json({
        success: true,
        message: alreadyFollowing
          ? "Désabonnement effectué."
          : "Abonnement réussi.",
        following: !alreadyFollowing,
        followersCount: targetUser.followers.length,
      });
    } catch (error) {
      console.error("Erreur follow/unfollow :", error);
      res
        .status(500)
        .json({ message: "Erreur serveur lors du suivi/désabonnement." });
    }
  })
);

// ========================================
// PATCH /api/users/:role/avatar
// ========================================
router.patch(
  "/:role/avatar",
  protect,
  upload.single("avatar"),
  asyncHandler(async (req, res) => {
    const { role } = req.params;
    if (!["client", "pro"].includes(role))
      return res
        .status(400)
        .json({ message: "Rôle invalide (client ou pro requis)" });
    if (!req.file)
      return res.status(400).json({ message: "Aucun fichier fourni" });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "avatars", resource_type: "image" },
        (err, cloudResult) => (err ? reject(err) : resolve(cloudResult))
      );
      uploadStream.end(req.file.buffer);
    });

    const field = role === "client" ? "avatarClient" : "avatarPro";
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { [field]: result.secure_url },
      { new: true }
    ).select("-password");

    res.json({ message: "Avatar mis à jour", user });
  })
);

// ========================================
// GET /api/users/check-email
// ========================================
router.get(
  "/check-email",
  [query("email").isEmail().withMessage("Email invalide")],
  validate,
  asyncHandler(async (req, res) => {
    const exists = await User.exists({ email: req.query.email });
    res.json({ message: "Vérification effectuée", exists: !!exists });
  })
);

// ========================================
// GET /api/users/:id/public
// ========================================
router.get(
  "/:id/public",
  [param("id").isMongoId().withMessage("ID utilisateur invalide")],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select("-password -email")
      .lean();
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    if (user.proProfile) {
      user.proProfile = {
        businessName: user.proProfile.businessName,
        status: user.proProfile.status,
        categories: user.proProfile.categories || [],
        services: user.proProfile.services || [],
        location: user.proProfile.location || null,
        headerImage: user.proProfile.headerImage || null,
      };
    }

    res.json({ message: "Profil public récupéré", user });
  })
);

// ========================================
// GET /api/users/:id
// ========================================
router.get(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("ID utilisateur invalide")],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json({ message: "Profil récupéré", user });
  })
);

module.exports = router;
