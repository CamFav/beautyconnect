const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const { protect } = require("../../middleware/auth");

// POST /api/posts/:id/favorite
router.post("/:id/favorite", protect, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable" });
    }

    const alreadyFavorited = post.favorites.includes(userId);

    if (alreadyFavorited) {
      // Retirer des favoris
      post.favorites = post.favorites.filter((id) => id.toString() !== userId);
    } else {
      // Ajouter aux favoris
      post.favorites.push(userId);
    }

    await post.save();

    res.json({
      message: alreadyFavorited
        ? "Retiré des favoris"
        : "Ajouté aux favoris",
      favorited: !alreadyFavorited,
      favoritesCount: post.favorites.length,
    });
  } catch (error) {
    console.error("Erreur favoris :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
