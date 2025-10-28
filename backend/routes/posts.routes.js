const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const { body, param, query } = require("express-validator");
const validate = require("../middleware/validate");

// Anti-injection
const allowOnly = (allowedKeys, data) => {
  Object.keys(data).forEach((key) => {
    if (!allowedKeys.includes(key)) delete data[key];
  });
};

// Cloudinary helper
const uploadToCloudinary = (fileBuffer, folder = "posts") =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });

// ========================================
// GET /api/posts
// ========================================
router.get(
  "/",
  [query("provider").optional().isMongoId().withMessage("provider invalide")],
  validate,
  async (req, res) => {
    try {
      const filter = req.query.provider ? { provider: req.query.provider } : {};
      const posts = await Post.find(filter)
        .populate("provider", "name proProfile avatarClient avatarPro")
        .sort({ createdAt: -1 });

      res.json({ message: "Posts récupérés avec succès", posts });
    } catch (err) {
      if (process.env.NODE_ENV !== "production")
        console.error("Erreur GET /posts:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// ========================================
// POST /api/posts
// ========================================
router.post(
  "/",
  protect,
  upload.single("media"),
  [
    body("description").optional().trim().escape(),
    body("category").optional().trim().escape(),
  ],
  validate,
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Aucun fichier uploadé." });

      allowOnly(["description", "category"], req.body);

      const description = req.body.description || "";
      const category = req.body.category || "other";

      const result = await uploadToCloudinary(req.file.buffer);

      const newPost = await Post.create({
        provider: req.user.id,
        mediaUrl: result.secure_url,
        description,
        category,
      });

      res.status(201).json({ message: "Post créé avec succès", post: newPost });
    } catch (err) {
      if (process.env.NODE_ENV !== "production")
        console.error("Erreur POST /posts:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// ========================================
// PATCH /api/posts/:id
// ========================================
router.patch(
  "/:id",
  protect,
  upload.single("media"),
  [
    param("id").isMongoId().withMessage("ID invalide"),
    body("description").optional().trim().escape(),
    body("category").optional().trim().escape(),
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: "Post introuvable" });
      if (post.provider.toString() !== req.user.id)
        return res.status(403).json({ message: "Accès refusé" });

      allowOnly(["description", "category"], req.body);

      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        if (result?.secure_url) post.mediaUrl = result.secure_url;
      }

      if (req.body.description) post.description = req.body.description;
      if (req.body.category) post.category = req.body.category;

      await post.save();
      res.json({ message: "Post mis à jour", post });
    } catch (err) {
      if (process.env.NODE_ENV !== "production")
        console.error("Erreur PATCH /posts:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// ========================================
// DELETE /api/posts/:id
// ========================================
router.delete(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("ID invalide")],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: "Post introuvable" });
      if (post.provider.toString() !== req.user.id)
        return res.status(403).json({ message: "Accès refusé" });

      await post.deleteOne();
      res.json({ message: "Post supprimé avec succès" });
    } catch (err) {
      if (process.env.NODE_ENV !== "production")
        console.error("Erreur DELETE /posts:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// ========================================
// POST /api/posts/:id/like
// ========================================
router.post(
  "/:id/like",
  protect,
  [param("id").isMongoId().withMessage("ID invalide")],
  validate,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post introuvable" });

      const userId = req.user.id;
      const alreadyLiked = post.likes.includes(userId);
      post.likes = alreadyLiked
        ? post.likes.filter((id) => id.toString() !== userId)
        : [...post.likes, userId];

      await post.save();
      res.json({
        message: alreadyLiked ? "Like retiré" : "Post liké",
        liked: !alreadyLiked,
        likesCount: post.likes.length,
      });
    } catch (err) {
      if (process.env.NODE_ENV !== "production")
        console.error("Erreur like:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// ========================================
// POST /api/posts/:id/favorite
// ========================================
router.post(
  "/:id/favorite",
  protect,
  [param("id").isMongoId().withMessage("ID invalide")],
  validate,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post introuvable" });

      const userId = req.user.id;
      const alreadyFavorited = post.favorites.includes(userId);
      post.favorites = alreadyFavorited
        ? post.favorites.filter((id) => id.toString() !== userId)
        : [...post.favorites, userId];

      await post.save();
      res.json({
        message: alreadyFavorited ? "Retiré des favoris" : "Ajouté aux favoris",
        favorited: !alreadyFavorited,
        favoritesCount: post.favorites.length,
      });
    } catch (err) {
      if (process.env.NODE_ENV !== "production")
        console.error("Erreur favoris:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

module.exports = router;
