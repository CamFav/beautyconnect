/**
 * Contrôleur : Export des données utilisateur (RGPD - Portabilité)
 * ---------------------------------------------------------------
 * Permet à un utilisateur authentifié d’obtenir une copie complète
 * de ses données personnelles (profil, posts, réservations).
 *
 */

const User = require("../../models/User");
const Post = require("../../models/Post");
const Reservation = require("../../models/Reservation");

exports.exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupère toutes les données liées à l’utilisateur
    const [user, posts, reservations] = await Promise.all([
      User.findById(userId).select("-password -__v").lean(),
      Post.find({ provider: userId }).select("-__v").lean(),
      Reservation.find({
        $or: [{ clientId: userId }, { proId: userId }],
      })
        .select("-__v")
        .lean(),
    ]);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        format: "JSON",
        version: "1.0",
        legal: {
          description:
            "Ce fichier contient les données personnelles associées à votre compte BeautyConnect.",
          rights:
            "Vous pouvez demander leur suppression via /api/account/delete.",
        },
      },
      user,
      posts,
      reservations,
    };

    // Retourne le fichier JSON directement
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="export_beautyconnect.json"'
    );
    res.status(200).json(exportData);
  } catch (err) {
    console.error("Erreur exportUserData:", err);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l’export des données." });
  }
};
