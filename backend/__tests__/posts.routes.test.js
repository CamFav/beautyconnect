
// Mock du middleware d'authentification
jest.mock("../middleware/auth", () => ({
  protect: (req, res, next) => {
    req.user = { id: "fakeUserId" };
    next();
  },
}));

const request = require("supertest");
const app = require("../app");
const Post = require("../models/Post");

// éviter les appels réels à la base de données
jest.mock("../models/Post");

describe("Tests API - Posts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/posts doit renvoyer 200 et un tableau", async () => {
    Post.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      }),
    });

    const res = await request(app)
      .get("/api/posts")
      .expect(200);

    expect(Array.isArray(res.body.posts)).toBe(true);
  });

  it("GET /api/posts?provider=123 doit filtrer les posts par provider", async () => {
    const mockPosts = [
      { _id: "1", description: "Post A", provider: "123" },
      { _id: "2", description: "Post B", provider: "123" },
    ];

    // Mock avec un provider en query
    Post.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPosts),
      }),
    });

    const res = await request(app)
      .get("/api/posts?provider=123")
      .expect(200);

    expect(res.body.posts.length).toBe(2);
    expect(res.body.posts[0].provider).toBe("123");
  });

  it("GET /api/posts doit renvoyer 500 en cas d'erreur serveur", async () => {
    Post.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("DB error")),
      }),
    });

    const res = await request(app)
      .get("/api/posts")
      .expect(500);

    expect(res.body.message).toBe("Erreur serveur");
  });
});
