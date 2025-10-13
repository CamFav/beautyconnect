// Auth mock
jest.mock("../middleware/auth", () => ({
  protect: (req, res, next) => {
    req.user = { id: "fakeUserId" };
    next();
  },
}));

jest.mock("../models/User", () => ({
  findById: jest.fn(),
}));


const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("GET /api/users/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renvoie 200 et les infos de l'utilisateur", async () => {
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        _id: "123",
        name: "Alice",
        email: "alice@test.com",
        password: undefined, // exclu
      }),
    });

    const res = await request(app).get("/api/users/123");

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe("Alice");
    expect(res.body.user.password).toBeUndefined();
  });

  it("renvoie 404 si l'utilisateur n'existe pas", async () => {
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).get("/api/users/inconnu");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Utilisateur introuvable");
  });

  it("renvoie 500 en cas d'erreur serveur", async () => {
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockRejectedValue(new Error("DB error")),
    });

    const res = await request(app).get("/api/users/erreur");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur serveur");
  });
});
