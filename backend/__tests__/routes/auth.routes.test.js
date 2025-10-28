const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");

// ========================
// Mocks
// ========================
const mockSave = jest.fn();
const mockFindOne = jest.fn();
const mockFindById = jest.fn();

jest.mock("../../models/User", () => {
  const m = function (data) {
    Object.assign(this, data);
    this.save = mockSave;
  };
  m.findOne = mockFindOne;
  m.findById = mockFindById;
  return m;
});

jest.mock("../../utils/jwt", () => ({
  generateToken: jest.fn(() => "fake-jwt-token"),
}));

jest.mock("../../middleware/auth", () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: "123" };
    next();
  }),
}));

const User = require("../../models/User");
const { generateToken } = require("../../utils/jwt");
const { protect } = require("../../middleware/auth");

const authRoutes = require("../../routes/auth.routes");

const app = express();
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockReset();
    mockFindOne.mockReset();
    mockFindById.mockReset();
  });

  // ====================================
  // REGISTER
  // ====================================
  describe("POST /api/auth/register", () => {
    it("devrait créer un utilisateur client avec succès", async () => {
      mockFindOne.mockResolvedValue(null);
      mockSave.mockResolvedValue(true);

      const res = await request(app).post("/api/auth/register").send({
        name: "Jean Dupont",
        email: "jean@example.com",
        password: "Password1",
      });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe("jean@example.com");
      expect(mockSave).toHaveBeenCalled();
    });

    it("devrait créer un utilisateur pro avec proProfile complet", async () => {
      mockFindOne.mockResolvedValue(null);
      mockSave.mockResolvedValue(true);

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Pro Test",
          email: "pro@example.com",
          password: "Password1",
          role: "pro",
          proProfile: {
            businessName: "Pro & Co",
            siret: "12345678900011",
            location: { city: "Paris", country: "France" },
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/succès/);
    });

    it("doit refuser si l'email est déjà utilisé", async () => {
      mockFindOne.mockResolvedValue({ _id: "abc" });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test",
        email: "used@example.com",
        password: "Password1",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe("email");
    });

    it("doit refuser un nom invalide", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "X", email: "ok@example.com", password: "Password1" });
      expect(res.status).toBe(400);
    });

    it("doit refuser un email invalide", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Valid", email: "invalid", password: "Password1" });
      expect(res.status).toBe(400);
    });

    it("doit refuser un mot de passe invalide", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Valid", email: "ok@example.com", password: "abc" });
      expect(res.status).toBe(400);
    });

    it("doit refuser un rôle invalide", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Valid",
        email: "ok@example.com",
        password: "Password1",
        role: "hacker",
      });
      expect(res.status).toBe(400);
    });

    it("doit refuser un pro sans city/country", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Pro sans ville",
          email: "pro2@example.com",
          password: "Password1",
          role: "pro",
          proProfile: { location: {} },
        });
      expect(res.status).toBe(400);
    });

    it("doit gérer une erreur serveur pendant save()", async () => {
      mockFindOne.mockResolvedValue(null);
      mockSave.mockRejectedValue(new Error("DB down"));

      const res = await request(app).post("/api/auth/register").send({
        name: "Crash Test",
        email: "crash@example.com",
        password: "Password1",
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur serveur");
    });
  });

  // ====================================
  // LOGIN
  // ====================================
  describe("POST /api/auth/login", () => {
    it("devrait connecter avec succès", async () => {
      const mockCompare = jest.fn().mockResolvedValue(true);

      // simulate mongoose chain
      mockFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "123",
          name: "Jean",
          email: "jean@example.com",
          comparePassword: mockCompare,
        }),
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "jean@example.com", password: "Password1" });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe("fake-jwt-token");
      expect(generateToken).toHaveBeenCalled();
    });

    it("doit refuser si utilisateur non trouvé", async () => {
      mockFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "unknown@example.com", password: "Password1" });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe("email");
    });

    it("doit refuser si mot de passe incorrect", async () => {
      const mockCompare = jest.fn().mockResolvedValue(false);

      mockFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "123",
          email: "bad@example.com",
          comparePassword: mockCompare,
        }),
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "bad@example.com", password: "wrong" });

      expect(res.status).toBe(401);
      expect(res.body.errors[0].field).toBe("password");
    });

    it("doit renvoyer une erreur serveur si crash", async () => {
      mockFindOne.mockImplementation(() => {
        throw new Error("DB down");
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "error@example.com", password: "Password1" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur serveur");
    });
  });

  // ====================================
  // ME
  // ====================================
  describe("GET /api/auth/me", () => {
    it("devrait renvoyer le profil utilisateur", async () => {
      mockFindById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({
          _id: "123",
          name: "Jean",
          email: "jean@example.com",
          proProfile: {
            businessName: "Biz",
            location: { city: "Paris", country: "France" },
          },
        }),
      });

      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(200);
      expect(res.body.email).toBe("jean@example.com");
    });

    it("doit renvoyer 401 si token invalide", async () => {
      protect.mockImplementationOnce((req, res, next) => {
        req.user = null;
        next();
      });
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("doit renvoyer 404 si user non trouvé", async () => {
      mockFindById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(404);
    });

    it("doit renvoyer 500 en cas d'erreur serveur", async () => {
      mockFindById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error("DB crash")),
      });
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(500);
    });
  });

  describe("Helpers internes auth.routes.js", () => {
    it("doit ignorer les champs non autorisés (allowOnly)", async () => {
      const spySave = jest.fn().mockResolvedValue(true);
      mockFindOne.mockResolvedValue(null);
      mockSave.mockImplementation(spySave);

      const res = await request(app).post("/api/auth/register").send({
        name: "Jean",
        email: "jean@safe.com",
        password: "Password1",
        role: "client",
        evilField: "injection_test", // non autorisé
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      // Vérifie que le champ non autorisé n'a pas survécu
      expect(spySave.mock.calls[0][0]?.evilField).toBeUndefined;
    });

    it("doit attraper une erreur serveur inattendue dans /login (catch global)", async () => {
      // simulate bug dans comparePassword
      mockFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "999",
          name: "BugUser",
          email: "bug@example.com",
          comparePassword: jest.fn(() => {
            throw new Error("Unexpected fail");
          }),
        }),
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "bug@example.com", password: "Password1" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur serveur");
    });
  });
});
