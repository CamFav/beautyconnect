const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");

// GET /api/posts
router.get("/", async (req, res) => {
  try {
    // filtrer par provider via query
    const filter = {};
    if (req.query.provider) {
      filter.provider = req.query.provider;
    }

    const posts = await Post.find(filter)
      .populate("provider", "name proProfile avatarClient avatarPro")
      .sort({ createdAt: -1 });

    res.json({
      message: "Liste des posts récupérée avec succès",
      posts,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des posts:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
