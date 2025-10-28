const multer = require("multer");
const path = require("path");

/**
 * Middleware d'upload sécurisé (mémoire)
 * - Taille max : 5 Mo
 * - Formats autorisés : jpg, jpeg, png, webp
 * - Vérifie extension + MIME type
 */

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: (req, file, cb) => {
    try {
      const fileTypes = /jpeg|jpg|png|webp/;
      const extValid = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimeValid = fileTypes.test(file.mimetype);

      if (extValid && mimeValid) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Type de fichier non autorisé (jpg, jpeg, png, webp uniquement)."
          )
        );
      }
    } catch (err) {
      cb(new Error("Erreur lors de la validation du fichier."));
    }
  },
});

module.exports = upload;
