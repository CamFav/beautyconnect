const request = require("supertest");
const path = require("path");

// Mock middleware/auth
jest.mock("../middleware/auth", () => ({
  protect: (req, res, next) => {
    req.user = { id: "fakeUserId" };
    next();
  },
}));

// Mock multer
jest.mock("../middleware/upload", () => ({
  single: () => (req, res, next) => {
    if (req.headers["x-test-no-file"]) {
      req.file = undefined;
    } else {
      req.file = {
        buffer: Buffer.from("fakeimagecontent"),
        originalname: "fake-image.jpg",
        mimetype: "image/jpeg",
      };
    }
    next();
  },
}));

// Mock Cloudinary
jest.mock("../config/cloudinary", () => ({
  uploader: {
    upload_stream: (options, callback) => {
      callback(null, { secure_url: "http://fake-cloudinary-url.com/file.jpg" });
      return { end: () => {} };
    },
  },
}));

// Mock du modèle Post
jest.mock("../models/Post", () => ({
  create: jest.fn().mockResolvedValue({
    _id: "123",
    provider: "fakeUserId",
    mediaUrl: "http://fake-cloudinary-url.com/file.jpg",
    description: "Test post",
    category: "makeup",
  }),
}));

// Import de l'app
const app = require("../app");

describe("POST /api/posts", () => {
  it("doit créer un post et renvoyer 201", async () => {
  const res = await request(app)
    .post("/api/posts")
    .attach("media", Buffer.from("fake"), "fake-image.jpg")
    .field("description", "Test post")
    .field("category", "makeup");

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("post");
  expect(res.body.post.mediaUrl).toBe("http://fake-cloudinary-url.com/file.jpg");
});

  it("doit renvoyer 400 si aucun fichier n'est envoyé", async () => {
  const res = await request(app)
    .post("/api/posts")
    .set("x-test-no-file", "true")
    .field("description", "Pas de fichier");

  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Aucun fichier uploadé.");
});

  it("doit renvoyer 500 si Cloudinary renvoie une erreur", async () => {
    jest.resetModules();

    // remocker Cloudinary uniquement pour ce test
    jest.doMock("../config/cloudinary", () => ({
      uploader: {
        upload_stream: (options, callback) => {
          callback(new Error("Erreur Cloudinary"), null);
          return { end: () => {} };
        },
      },
    }));

    const appWithError = require("../app");
    const fakeImagePath = path.join(__dirname, "fixtures", "fake-image.jpg");

    const res = await request(appWithError)
      .post("/api/posts")
      .attach("media", fakeImagePath)
      .field("description", "Test avec erreur Cloudinary");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur upload Cloudinary");
  });
});
