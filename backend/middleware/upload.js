const multer = require("multer");
const path = require("path");

// Stockage en mémoire avant upload vers Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (extname) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

module.exports = upload;
