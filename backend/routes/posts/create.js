const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const { protect } = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const cloudinary = require("../../config/cloudinary");

// POST /api/posts (upload direct vers Cloudinary)
router.post("/", protect, upload.single("media"), async (req, res) => {
  console.log("req.file :", req.file);
  console.log("req.body :", req.body);

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier uploadé." });
    }

    const description = req.body.description || "Test post";
    const category = req.body.category || "other";


    // Upload via flux à partir du buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "posts" },
      async (error, result) => {
        if (error) {
          console.error("Erreur Cloudinary :", error);
          return res.status(500).json({ message: "Erreur upload Cloudinary" });
        }

        try {
          const newPost = await Post.create({
            provider: req.user.id,
            mediaUrl: result.secure_url,
            description,
            category: category || "other",
          });

          res.status(201).json({
            message: "Post créé avec succès",
            post: newPost,
          });
        } catch (err) {
          console.error("Erreur création post:", err);
          res.status(500).json({ message: "Erreur serveur" });
        }
      }
    );

    // envoie le buffer à Cloudinary
    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("Erreur création post:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
