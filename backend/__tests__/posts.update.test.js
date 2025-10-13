const mockSave = jest.fn(function () {
  return Promise.resolve(this); // Simule un post sauvegardé
});

// Mock du middleware auth
jest.mock("../middleware/auth", () => ({
  protect: (req, res, next) => {
    req.user = { id: "fakeUserId" };
    next();
  },
}));

// Mock du middleware upload
jest.mock("../middleware/upload", () => ({
  single: () => (req, res, next) => {
    // simulateur de "fichier envoyé"
    if (!req.skipFile) {
      req.file = { path: "/fake/path/to/image.jpg" };
    }
    next();
  },
}));

// Mock du modèle Post
jest.mock("../models/Post", () => ({
  findById: jest.fn(),
}));

// Mock de Cloudinary
jest.mock("../config/cloudinary", () => {
  const mockUpload = jest.fn();
  return {
    uploader: {
      upload: (...args) => mockUpload(...args),
    },
    __mockUpload: mockUpload,
  };
});

// importe app et les modules
const request = require("supertest");
const app = require("../app");
const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
const mockUpload = cloudinary.__mockUpload;

describe("PATCH /api/posts/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renvoie 404 si le post est introuvable", async () => {
    Post.findById.mockResolvedValueOnce(null);

    const res = await request(app)
      .patch("/api/posts/invalid-id")
      .send({ description: "New desc" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Post introuvable");
  });

  it("renvoie 403 si l'utilisateur n'est pas le propriétaire", async () => {
    Post.findById.mockResolvedValueOnce({
      provider: { toString: () => "anotherUserId" },
    });

    const res = await request(app)
      .patch("/api/posts/post123")
      .send({ description: "Updated" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Accès refusé");
  });

  it("met à jour le texte sans fichier", async () => {
    const fakePost = {
      provider: { toString: () => "fakeUserId" },
      save: mockSave,
      description: "Old desc",
      category: "oldCat",
      mediaUrl: "old-url",
    };

    Post.findById.mockResolvedValueOnce(fakePost);

    const res = await request(app)
      .patch("/api/posts/post123")
      .send({ description: "New desc" });

    // Simule que save applique la desc
    fakePost.description = "New desc";

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body.post.description).toBe("New desc");
  });

  it("met à jour l'image si un fichier est envoyé", async () => {
    const fakePost = {
      provider: { toString: () => "fakeUserId" },
      save: mockSave,
      mediaUrl: "old-url",
      description: "Old desc",
    };

    Post.findById.mockResolvedValueOnce(fakePost);

    mockUpload.mockResolvedValueOnce({
      secure_url: "http://fake-new-url.com/image.jpg",
    });

    const res = await request(app)
      .patch("/api/posts/post123")
      .send({ description: "Updated" });

    fakePost.mediaUrl = "http://fake-new-url.com/image.jpg";

    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body.post.mediaUrl).toBe("http://fake-new-url.com/image.jpg");
  });

  it("renvoie 500 si Cloudinary échoue", async () => {
    const fakePost = {
      provider: { toString: () => "fakeUserId" },
      save: mockSave,
      mediaUrl: "old-url",
      description: "Old desc",
    };

    Post.findById.mockResolvedValueOnce(fakePost);

    mockUpload.mockRejectedValueOnce(new Error("Erreur Cloudinary"));

    const res = await request(app)
      .patch("/api/posts/post123")
      .send({ description: "Test error" });

    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur serveur");
  });
});
