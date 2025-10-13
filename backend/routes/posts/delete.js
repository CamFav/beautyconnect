const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const { protect } = require("../../middleware/auth");

// DELETE /api/posts/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifie si le post existe
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable" });
    }

    // Vérifie si l'utilisateur est le propriétaire
    if (post.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await post.deleteOne();

    res.json({ message: "Post supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression post :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
