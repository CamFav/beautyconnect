global.validateName = () => true;

const request = require("supertest");
const express = require("express");
const router = require("../../routes/account.routes");
const User = require("../../models/User");

// On mock le middleware protect pour injecter un utilisateur factice
jest.mock("../../middleware/auth", () => ({
  protect: (req, res, next) => {
    req.user = { id: "user123", role: "client" };
    next();
  },
}));

jest.mock("../../middleware/upload", () => ({
  single: () => (req, res, next) => next(),
}));

jest.mock("../../models/User");

// Mock des contrôleurs
const accountController = require("../../controllers/account/account.controller");
jest.mock("../../controllers/account/account.controller", () => ({
  updateRole: jest.fn((req, res) => res.json({ route: "updateRole" })),
  updateProfile: jest.fn((req, res) => res.json({ route: "updateProfile" })),
  updateProProfile: jest.fn((req, res) =>
    res.json({ route: "updateProProfile" })
  ),
  updateProHeaderImage: jest.fn((req, res) =>
    res.json({ route: "updateProHeaderImage" })
  ),
  updatePassword: jest.fn((req, res) => res.json({ route: "updatePassword" })),
  deleteAccount: jest.fn((req, res) => res.json({ route: "deleteAccount" })),
}));

const app = express();
app.use(express.json());
app.use("/api/account", router);

describe("Account Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============= PATCH ROUTES TESTS =============
  const patchRoutes = [
    { path: "/role", key: "updateRole" },
    { path: "/profile", key: "updateProfile" },
    { path: "/pro-profile", key: "updateProProfile" },
    { path: "/pro/header", key: "updateProHeaderImage" },
    { path: "/upgrade-pro", key: "updateProProfile" },
    { path: "/password", key: "updatePassword" },
  ];

  patchRoutes.forEach(({ path, key }) => {
    it(`PATCH ${path} appelle ${key}`, async () => {
      const res = await request(app)
        .patch(`/api/account${path}`)
        .send({ test: true });
      expect(res.body.route).toBe(key);
      expect(accountController[key]).toHaveBeenCalled();
    });
  });

  // ============= DELETE ROUTE TEST =============
  it("DELETE /delete appelle deleteAccount", async () => {
    const res = await request(app).delete("/api/account/delete");
    expect(res.body.route).toBe("deleteAccount");
    expect(accountController.deleteAccount).toHaveBeenCalled();
  });

  // ============= PUT /upgrade TEST =============
  describe("PUT /upgrade", () => {
    it("retourne 404 si user introuvable", async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .put("/api/account/upgrade")
        .send({
          businessName: "Salon Test",
          location: { city: "Paris", country: "France" },
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/introuvable/);
    });

    it("retourne 400 si le SIRET est invalide", async () => {
      User.findById.mockResolvedValue({ save: jest.fn() });

      const res = await request(app)
        .put("/api/account/upgrade")
        .send({
          businessName: "Salon Test",
          siret: "abc",
          location: { city: "Paris", country: "France" },
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].field).toBe("siret");
    });

    it("met à niveau l'utilisateur vers PRO", async () => {
      const mockUser = {
        save: jest.fn(),
        proProfile: {},
      };
      User.findById.mockResolvedValue(mockUser);

      const res = await request(app)
        .put("/api/account/upgrade")
        .send({
          businessName: "Salon Test",
          siret: "12345678901234",
          location: { city: "Paris", country: "France" },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/PRO/);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});
