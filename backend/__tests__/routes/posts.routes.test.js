const express = require("express");
const request = require("supertest");

// ===== MOCKS =====
jest.mock("../../middleware/auth", () => ({
  protect: (req, res, next) => {
    req.user = { id: "mockUserId" };
    next();
  },
}));

jest.mock("../../middleware/upload", () => ({
  single: () => (req, res, next) => {
    req.file = { buffer: Buffer.from("fake"), path: "fakepath" };
    next();
  },
}));

jest.mock("../../config/cloudinary", () => ({
  uploader: {
    upload_stream: jest.fn(),
    upload: jest.fn(),
  },
}));

const Post = require("../../models/Post");
jest.mock("../../models/Post", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

const router = require("../../routes/posts.routes");
const app = express();
app.use(express.json());
app.use("/api/posts", router);

// ====================================================
// TESTS
// ====================================================
describe("Posts Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET / ---
  it("GET / retourne la liste des posts", async () => {
    Post.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([{ id: 1 }]),
    });

    const res = await request(app).get("/api/posts");
    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(1);
  });

  it("GET / retourne 500 si erreur Mongoose", async () => {
    Post.find.mockImplementationOnce(() => {
      throw new Error("DB down");
    });
    const res = await request(app).get("/api/posts");
    expect(res.statusCode).toBe(500);
  });

  // --- POST / ---
  it("POST / crée un post (upload Cloudinary simulé)", async () => {
    const cloudinary = require("../../config/cloudinary");
    cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => {
      cb(null, { secure_url: "https://mock.cloudinary/post.jpg" });
      return { end: jest.fn() };
    });

    Post.create.mockResolvedValue({ id: 1, mediaUrl: "https://mock" });

    const res = await request(app)
      .post("/api/posts")
      .attach("media", Buffer.from("fake"), "test.jpg")
      .field("description", "un post");

    expect(res.statusCode).toBe(201);
    expect(res.body.post).toHaveProperty("id");
  });

  it("POST / retourne 500 si Cloudinary échoue", async () => {
    const cloudinary = require("../../config/cloudinary");
    cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => {
      cb(new Error("Upload fail"));
      return { end: jest.fn() };
    });

    const res = await request(app)
      .post("/api/posts")
      .attach("media", Buffer.from("fake"), "test.jpg");

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Cloudinary/);
  });

  it("POST / retourne 400 si aucun fichier", async () => {
    // On force Jest à oublier le module upload et posts.routes
    jest.resetModules();

    // Nouveau mock propre
    jest.doMock("../../middleware/upload", () => ({
      single: () => (req, res, next) => {
        req.file = null; // simulate no file
        next();
      },
    }));

    const express = require("express");
    const router = require("../../routes/posts.routes");

    const localApp = express();
    localApp.use(express.json());
    localApp.use("/api/posts", router);

    const res = await request(localApp).post("/api/posts").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Aucun fichier uploadé/);
  });

  // --- PATCH /:id ---
  it("PATCH /:id met à jour un post existant", async () => {
    const cloudinary = require("../../config/cloudinary");

    const mockPost = {
      provider: "mockUserId",
      save: jest.fn(),
    };

    Post.findById.mockResolvedValue(mockPost);
    cloudinary.uploader.upload.mockResolvedValue({
      secure_url: "https://mock.cloudinary/updated.jpg",
    });

    const res = await request(app)
      .patch("/api/posts/507f1f77bcf86cd799439011")
      .attach("media", Buffer.from("fake"), "test.jpg")
      .field("description", "updated");

    expect(res.statusCode).toBe(200);
    expect(mockPost.save).toHaveBeenCalled();
  });

  it("PATCH /:id retourne 403 si le post appartient à un autre utilisateur", async () => {
    Post.findById.mockResolvedValue({ provider: "otherUserId" });
    const res = await request(app)
      .patch("/api/posts/507f1f77bcf86cd799439011")
      .field("description", "unauthorized");
    expect(res.statusCode).toBe(403);
  });

  it("PATCH /:id retourne 500 si Post.save échoue", async () => {
    const mockPost = {
      provider: "mockUserId",
      save: jest.fn().mockRejectedValue(new Error("Save failed")),
    };
    Post.findById.mockResolvedValue(mockPost);

    const res = await request(app)
      .patch("/api/posts/507f1f77bcf86cd799439011")
      .field("description", "fail save");
    expect(res.statusCode).toBe(500);
  });

  it("PATCH /:id retourne 404 si post introuvable", async () => {
    Post.findById.mockResolvedValue(null);
    const res = await request(app)
      .patch("/api/posts/507f1f77bcf86cd799439011")
      .field("description", "test");
    expect(res.statusCode).toBe(404);
  });

  // --- DELETE /:id ---
  it("DELETE /:id supprime un post", async () => {
    const mockPost = {
      provider: "mockUserId",
      deleteOne: jest.fn(),
    };
    Post.findById.mockResolvedValue(mockPost);
    const res = await request(app).delete(
      "/api/posts/507f1f77bcf86cd799439011"
    );
    expect(res.statusCode).toBe(200);
    expect(mockPost.deleteOne).toHaveBeenCalled();
  });

  it("DELETE /:id retourne 403 si provider ≠ user", async () => {
    Post.findById.mockResolvedValue({ provider: "someoneElse" });
    const res = await request(app).delete(
      "/api/posts/507f1f77bcf86cd799439011"
    );
    expect(res.statusCode).toBe(403);
  });

  it("DELETE /:id retourne 404 si introuvable", async () => {
    Post.findById.mockResolvedValue(null);
    const res = await request(app).delete(
      "/api/posts/507f1f77bcf86cd799439011"
    );
    expect(res.statusCode).toBe(404);
  });

  // --- POST /:id/like ---
  it("POST /:id/like permet d’aimer ou retirer un post", async () => {
    const mockPost = {
      likes: [],
      save: jest.fn(),
    };
    Post.findById.mockResolvedValue(mockPost);

    const res = await request(app).post(
      "/api/posts/507f1f77bcf86cd799439011/like"
    );
    expect(res.statusCode).toBe(200);
    expect(mockPost.likes).toContain("mockUserId");
  });

  it("POST /:id/like retourne 404 si post introuvable", async () => {
    Post.findById.mockResolvedValue(null);
    const res = await request(app).post(
      "/api/posts/507f1f77bcf86cd799439011/like"
    );
    expect(res.statusCode).toBe(404);
  });

  // --- POST /:id/favorite ---
  it("POST /:id/favorite permet d’ajouter/retirer un favori", async () => {
    const mockPost = {
      favorites: [],
      save: jest.fn(),
    };
    Post.findById.mockResolvedValue(mockPost);

    const res = await request(app).post(
      "/api/posts/507f1f77bcf86cd799439011/favorite"
    );
    expect(res.statusCode).toBe(200);
    expect(mockPost.favorites).toContain("mockUserId");
  });

  it("POST /:id/favorite retourne 404 si post introuvable", async () => {
    Post.findById.mockResolvedValue(null);
    const res = await request(app).post(
      "/api/posts/507f1f77bcf86cd799439011/favorite"
    );
    expect(res.statusCode).toBe(404);
  });
});
