const multer = require("multer");
const path = require("path");
const upload = require("../../middleware/upload");

describe("Middleware - upload.js", () => {
  it("utilise un storage en mémoire", () => {
    // Vérifie qu'on utilise bien le memoryStorage de multer
    expect(upload.storage).toBeInstanceOf(multer.memoryStorage().constructor);
  });

  it("accepte les fichiers avec une extension autorisée", (done) => {
    const file = { originalname: "photo.png" };

    upload.fileFilter({}, file, (err, success) => {
      expect(err).toBeNull();
      expect(success).toBe(true);
      done();
    });
  });

  it("refuse les fichiers avec une extension non autorisée", (done) => {
    const file = { originalname: "document.pdf" };

    upload.fileFilter({}, file, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("Invalid file type");
      done();
    });
  });

  it("limite la taille à 5 Mo", () => {
    expect(upload.limits.fileSize).toBe(5 * 1024 * 1024);
  });
});
