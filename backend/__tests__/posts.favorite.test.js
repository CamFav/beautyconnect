// Mock de l’auth
jest.mock("../middleware/auth", () => ({
  protect: (req, res, next) => {
    req.user = { id: "fakeUserId" };
    next();
  },
}));

// Mock du modèle Post
jest.mock("../models/Post", () => ({
  findById: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const Post = require("../models/Post");

describe("POST /api/posts/:id/favorite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ajoute le favori si pas encore favori", async () => {
    const fakePost = {
      _id: "post123",
      favorites: [],
      save: jest.fn(),
    };

    Post.findById.mockResolvedValueOnce(fakePost);

    const res = await request(app).post("/api/posts/post123/favorite");

    expect(res.status).toBe(200); // ou 201 selon ta route
    expect(fakePost.favorites).toContain("fakeUserId");
  });

  it("retire le favori si déjà présent", async () => {
    const fakePost = {
      _id: "post123",
      favorites: ["fakeUserId"],
      save: jest.fn(),
    };

    Post.findById.mockResolvedValueOnce(fakePost);

    const res = await request(app).post("/api/posts/post123/favorite");

    expect(res.status).toBe(200);
    expect(fakePost.favorites).not.toContain("fakeUserId");
  });

  it("renvoie 404 si le post n'existe pas", async () => {
    Post.findById.mockResolvedValueOnce(null);

    const res = await request(app).post("/api/posts/inexistant/favorite");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Post introuvable");
  });

  it("renvoie 500 en cas d'erreur serveur", async () => {
    Post.findById.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).post("/api/posts/post123/favorite");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur serveur");
  });
});
