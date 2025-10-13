const request = require("supertest");
const app = require("../app");

// mocke le modèle Post
jest.mock("../models/Post", () => ({
  find: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        {
          _id: "post123",
          description: "Test post",
          mediaUrl: "http://test.com/image.jpg",
          provider: {
            name: "John",
          },
        },
      ]),
    }),
  }),
}));

describe("GET /api/posts", () => {
  it("doit retourner 200 et un tableau de posts", async () => {
    const res = await request(app).get("/api/posts");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("posts");
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.posts.length).toBe(1);
    expect(res.body.posts[0]._id).toBe("post123");
  });

  it("doit gérer les erreurs et renvoyer 500", async () => {
    const Post = require("../models/Post");
    Post.find.mockReturnValueOnce({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("DB error")),
      }),
    });

    const res = await request(app).get("/api/posts");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur serveur");
  });
});
