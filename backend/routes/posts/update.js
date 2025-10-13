const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const { protect } = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const cloudinary = require("../../config/cloudinary");


// PATCH /api/posts/:id
router.patch("/:id", protect, upload.single("media"), async (req, res) => {
  try {
    const { id } = req.params;
    const { description, category } = req.body;

    // Vérifie si le post existe
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable" });
    }

    // Vérifie si l'utilisateur le propriétaire du post
    if (post.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // upload vers stockage sur Cloudinary
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "posts",
        });

        // vérifie que result existe
        if (result && result.secure_url) {
          post.mediaUrl = result.secure_url;
        }
      } catch (err) {
        console.error("Erreur upload Cloudinary :", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
    }

    // Mise à jour des champs uniquement s'ils sont fournis
    if (description !== undefined) post.description = description;
    if (category !== undefined) post.category = category;

    await post.save();

    res.json({
      message: "Post mis à jour avec succès",
      post,
    });
  } catch (error) {
    console.error("Erreur mise à jour post :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
