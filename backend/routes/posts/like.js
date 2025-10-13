const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const { protect } = require("../../middleware/auth");

// POST /api/posts/:id/like
router.post("/:id/like", protect, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable" });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // Retirer like
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Ajouter like
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Like retiré" : "Post liké",
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Erreur like post :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
