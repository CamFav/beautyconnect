// ✅ Mock identiques à users.getOne.test.js
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

describe("POST /api/users/:id/follow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("s'abonne correctement si pas encore abonné", async () => {
    const fakeTargetUser = {
      _id: "provider123",
      followers: [],
      save: jest.fn(),
    };

    const fakeCurrentUser = {
      _id: "fakeUserId",
      following: [],
      save: jest.fn(),
    };

    // ⚠ L'ordre des .mockResolvedValueOnce doit respecter le code :
    // const targetUser = await User.findById(targetUserId);
    // const currentUser = await User.findById(currentUserId);
    User.findById
      .mockResolvedValueOnce(fakeTargetUser)     // targetUser
      .mockResolvedValueOnce(fakeCurrentUser);   // currentUser

    const res = await request(app).post("/api/users/provider123/follow");

    expect(res.status).toBe(200);
    expect(res.body.following).toBe(true);
    expect(fakeTargetUser.followers).toContain("fakeUserId");
    expect(fakeCurrentUser.following).toContain("provider123");
  });

  it("se désabonne si déjà abonné", async () => {
    const fakeTargetUser = {
      _id: "provider123",
      followers: ["fakeUserId"],
      save: jest.fn(),
    };

    const fakeCurrentUser = {
      _id: "fakeUserId",
      following: ["provider123"],
      save: jest.fn(),
    };

    User.findById
      .mockResolvedValueOnce(fakeTargetUser)
      .mockResolvedValueOnce(fakeCurrentUser);

    const res = await request(app).post("/api/users/provider123/follow");

    expect(res.status).toBe(200);
    expect(res.body.following).toBe(false);
    expect(fakeTargetUser.followers).not.toContain("fakeUserId");
    expect(fakeCurrentUser.following).not.toContain("provider123");
  });

  it("renvoie 404 si le prestataire n'existe pas", async () => {
    User.findById
      .mockResolvedValueOnce(null) // targetUser inexistant
      .mockResolvedValueOnce({
        _id: "fakeUserId",
        following: [],
        save: jest.fn(),
      });

    const res = await request(app).post("/api/users/inexistant/follow");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Utilisateur introuvable");
  });

  it("empêche de se follow soi-même", async () => {
    User.findById
      .mockResolvedValueOnce({
        _id: "fakeUserId",
        followers: [],
        following: [],
        save: jest.fn(),
      })
      .mockResolvedValueOnce({
        _id: "fakeUserId",
        followers: [],
        following: [],
        save: jest.fn(),
      });

    const res = await request(app).post("/api/users/fakeUserId/follow");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Impossible de se suivre soi-même");
  });

  it("renvoie 500 en cas d'erreur serveur", async () => {
  // nettoie tout ce qu'il y avait avant
  User.findById.mockReset();

  // Le premier appel crash
  User.findById.mockRejectedValueOnce(new Error("DB error"));

  const res = await request(app).post("/api/users/provider123/follow");

  expect(res.status).toBe(500);
  expect(res.body.message).toBe("Erreur serveur");
});

});
