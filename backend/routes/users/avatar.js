const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const upload = require("../../middleware/upload"); // multer (buffer)
const cloudinary = require("../../config/cloudinary");
const User = require("../../models/User");

// PATCH /api/users/:role/avatar
router.patch("/:role/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    const { role } = req.params;

    if (!["client", "pro"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide (client ou pro requis)" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    // Upload Cloudinary via buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        resource_type: "image",
      },
      async (error, cloudResult) => {
        if (error) {
          console.error("Erreur Cloudinary:", error);
          return res.status(500).json({ message: "Erreur upload Cloudinary" });
        }

        // Détermine le champ à mettre à jour
        const fieldToUpdate = role === "client" ? "avatarClient" : "avatarPro";

        const user = await User.findByIdAndUpdate(
          req.user.id,
          { [fieldToUpdate]: cloudResult.secure_url },
          { new: true }
        ).select("-password");

        return res.status(200).json({
          message: "Avatar mis à jour avec succès",
          user,
        });
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (err) {
    console.error("Erreur route avatar:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
