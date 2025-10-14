const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const { protect } = require("../../middleware/auth");

// POST /api/users/:id/follow
router.post("/:id/follow", protect, async (req, res) => {
    console.log("Route /:id/follow hit");
  try {
    console.log("Handler follow démarré");
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "Impossible de se suivre soi-même" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const alreadyFollowing = currentUser.following.includes(targetUserId);

    if (alreadyFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId
      );
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: alreadyFollowing
        ? "Désabonnement réussi"
        : "Abonnement réussi",
      following: !alreadyFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    console.error("Erreur follow:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
