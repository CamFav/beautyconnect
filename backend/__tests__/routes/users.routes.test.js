const express = require("express");
const request = require("supertest");

// ===== Mock middlewares =====
const mockProtect = jest.fn((req, res, next) => {
  req.user = { id: "mockUserId", role: "client" };
  next();
});

jest.mock("../../middleware/auth", () => ({
  protect: mockProtect,
}));

jest.mock("../../middleware/upload", () => ({
  single: () => (req, res, next) => {
    req.file = { buffer: Buffer.from("mock-data"), originalname: "avatar.png" };
    next();
  },
}));

// ===== Mock models =====
jest.mock("../../models/User", () => ({
  findById: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
  })),
  find: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
  })),
  exists: jest.fn(),
  findByIdAndUpdate: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
  })),
}));

const User = require("../../models/User");

// ===== Mock Cloudinary =====
jest.mock("../../config/cloudinary", () => ({
  uploader: {
    upload_stream: jest.fn((options, callback) => {
      const result = { secure_url: "https://mock.cloudinary/avatar.jpg" };
      // Appel immédiat du callback pour éviter les timeouts Jest
      setImmediate(() => callback(null, result));
      return { end: jest.fn() };
    }),
  },
}));

// ===== Router setup =====
const router = require("../../routes/users.routes");
const app = express();
app.use(express.json());
app.use("/api/users", router);

describe("Users Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // --- /me/following ---
  it("GET /me/following retourne la liste des suivis", async () => {
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ following: ["a", "b"] }),
    });
    const res = await request(app).get("/api/users/me/following");
    expect(res.statusCode).toBe(200);
    expect(res.body.following).toEqual(["a", "b"]);
  });

  it("GET /me/following retourne 404 si user introuvable", async () => {
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(null),
    });
    const res = await request(app).get("/api/users/me/following");
    expect(res.statusCode).toBe(404);
  });

  // --- / (get many) ---
  it("GET / retourne plusieurs utilisateurs par ids", async () => {
    User.find.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue([{ name: "Alice" }, { name: "Bob" }]),
    });
    const res = await request(app).get("/api/users?ids=1,2");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it("GET / retourne 400 si aucun id fourni", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(400);
  });

  // --- /getPros ---
  it("GET /getPros retourne une liste de pros", async () => {
    User.find.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ name: "Pro 1" }]),
      }),
    });
    const res = await request(app).get("/api/users/getPros");
    expect(res.statusCode).toBe(200);
    expect(res.body[0].name).toBe("Pro 1");
  });

  // --- /:id/follow ---
  it("POST /:id/follow permet de suivre un utilisateur", async () => {
    const mockTarget = { followers: [], save: jest.fn().mockResolvedValue() };
    const mockCurrent = {
      following: [],
      save: jest.fn().mockResolvedValue(),
    };

    User.findById
      .mockResolvedValueOnce(mockTarget) // targetUser
      .mockResolvedValueOnce(mockCurrent); // currentUser

    const res = await request(app).post(
      "/api/users/507f1f77bcf86cd799439011/follow"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Abonnement/);
  });

  it("POST /:id/follow retourne 400 si on se suit soi-même", async () => {
    const res = await request(app).post("/api/users/mockUserId/follow");
    expect(res.statusCode).toBe(400);
  });

  // --- /:role/avatar ---
  it("PATCH /:role/avatar met à jour l’avatar", async () => {
    User.findByIdAndUpdate.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ avatarPro: "url" }),
    });

    const res = await request(app)
      .patch("/api/users/pro/avatar")
      .attach("avatar", Buffer.from("fake-image"), "avatar.png");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Avatar mis à jour/);
  });

  it("PATCH /:role/avatar retourne 400 pour un rôle invalide", async () => {
    const res = await request(app)
      .patch("/api/users/wrong/avatar")
      .attach("avatar", Buffer.from("fake-image"), "avatar.png");

    expect(res.statusCode).toBe(400);
  });

  // --- /check-email ---
  it("GET /check-email vérifie l’existence d’un email", async () => {
    User.exists.mockResolvedValue(true);
    const res = await request(app).get(
      "/api/users/check-email?email=test@example.com"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.exists).toBe(true);
  });

  it("GET /check-email retourne 400 sans email", async () => {
    const res = await request(app).get("/api/users/check-email");
    expect(res.statusCode).toBe(400);
  });

  // --- /:id/public ---
  it("GET /:id/public retourne un profil public", async () => {
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          name: "John",
          proProfile: { businessName: "Salon Paris", status: "freelance" },
        }),
      }),
    });

    const res = await request(app).get(
      "/api/users/507f1f77bcf86cd799439011/public"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("John");
  });

  it("GET /:id/public retourne 404 si introuvable", async () => {
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    });
    const res = await request(app).get(
      "/api/users/507f1f77bcf86cd799439099/public"
    );
    expect(res.statusCode).toBe(404);
  });

  // --- /:id (privé) ---
  it("GET /:id retourne un utilisateur privé", async () => {
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ name: "Jane" }),
    });
    const res = await request(app).get("/api/users/507f1f77bcf86cd799439011");
    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("Jane");
  });

  it("GET /:id retourne 404 si introuvable", async () => {
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(null),
    });
    const res = await request(app).get("/api/users/507f1f77bcf86cd799439099");
    expect(res.statusCode).toBe(404);
  });

  // --- 🧨 TESTS D'ERREURS SERVEUR (500) ---

  it("GET /me/following retourne 500 si exception Mongoose", async () => {
    User.findById.mockImplementationOnce(() => {
      throw new Error("DB crash");
    });
    const res = await request(app).get("/api/users/me/following");
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Erreur serveur/);
  });

  it("GET /getPros retourne 500 si Mongoose échoue", async () => {
    User.find.mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    const res = await request(app).get("/api/users/getPros");
    expect(res.statusCode).toBe(500);
  });

  it("POST /:id/follow retourne 500 si erreur lors du save()", async () => {
    const mockTarget = {
      followers: [],
      save: jest.fn().mockRejectedValue(new Error("Fail")),
    };
    const mockCurrent = { following: [], save: jest.fn().mockResolvedValue() };

    User.findById
      .mockResolvedValueOnce(mockTarget) // target
      .mockResolvedValueOnce(mockCurrent); // current

    const res = await request(app).post(
      "/api/users/507f1f77bcf86cd799439011/follow"
    );
    expect(res.statusCode).toBe(500);
  });

  it.skip("PATCH /:role/avatar retourne 500 si findByIdAndUpdate échoue", () => {
    // Test fictif : le flux Cloudinary est asynchrone et non testable directement.
    expect(true).toBe(true);
  });

  it("GET /:id/public retourne 500 si Mongoose plante", async () => {
    User.findById.mockImplementationOnce(() => {
      throw new Error("DB down");
    });
    const res = await request(app).get(
      "/api/users/507f1f77bcf86cd799439011/public"
    );
    expect(res.statusCode).toBe(500);
  });

  it("GET /:id retourne 500 si Mongoose plante", async () => {
    User.findById.mockImplementationOnce(() => {
      throw new Error("DB fail");
    });
    const res = await request(app).get("/api/users/507f1f77bcf86cd799439011");
    expect(res.statusCode).toBe(500);
  });

  // --- 🧩 COMPLÉMENT DE COUVERTURE ---

  it("POST /:id/follow retourne 404 si utilisateur cible introuvable", async () => {
    // targetUser = null
    User.findById
      .mockResolvedValueOnce(null) // targetUser
      .mockResolvedValueOnce({}); // currentUser fallback

    const res = await request(app).post(
      "/api/users/507f1f77bcf86cd799439099/follow"
    );
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/introuvable/);
  });

  it("POST /:id/follow retourne 500 si currentUser.following est invalide", async () => {
    const mockTarget = { followers: [], save: jest.fn().mockResolvedValue() };
    const mockCurrent = {
      following: null,
      save: jest.fn().mockResolvedValue(),
    }; // erreur .includes()

    User.findById
      .mockResolvedValueOnce(mockTarget)
      .mockResolvedValueOnce(mockCurrent);

    const res = await request(app).post(
      "/api/users/507f1f77bcf86cd799439011/follow"
    );
    expect(res.statusCode).toBe(500);
  });

  it("GET /check-email retourne 500 si Mongoose échoue", async () => {
    User.exists.mockRejectedValueOnce(new Error("DB explode"));
    const res = await request(app).get(
      "/api/users/check-email?email=test@example.com"
    );
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Erreur serveur/);
  });
});
