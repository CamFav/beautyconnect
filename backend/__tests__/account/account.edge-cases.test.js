jest.mock("../../models/User", () => ({
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

const express = require("express");
const request = require("supertest");
const accountController = require("../../controllers/account/account.controller");
const User = require("../../models/User");

const app = express();
app.use(express.json());

// Fake auth
app.use((req, res, next) => {
  req.user = { id: "mockId" };
  next();
});

// 🧩 Ajout : simuler multer pour les fichiers
app.use((req, res, next) => {
  if (req.path.includes("/pro/header")) {
    req.file = { buffer: Buffer.from("fake"), originalname: "fake.jpg" };
  }
  next();
});

// Routes
app.patch("/api/account/role", accountController.updateRole);
app.patch("/api/account/profile", accountController.updateProfile);
app.patch("/api/account/pro-profile", accountController.updateProProfile);
app.patch("/api/account/pro/header", accountController.updateProHeaderImage);
app.patch("/api/account/password", accountController.updatePassword);

describe("Account Controller - Edge Cases (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updateRole → 404 si utilisateur non trouvé", async () => {
    User.findById.mockResolvedValueOnce(null);
    const res = await request(app)
      .patch("/api/account/role")
      .send({ role: "pro" });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/introuvable/i);
  });

  it("updateProfile → 404 si utilisateur non trouvé", async () => {
    User.findById.mockResolvedValueOnce(null);
    const res = await request(app)
      .patch("/api/account/profile")
      .send({ name: "Ghost User" });
    expect(res.statusCode).toBe(404);
  });

  it("updateProProfile → 404 si utilisateur non trouvé", async () => {
    User.findById.mockResolvedValueOnce(null);
    const res = await request(app)
      .patch("/api/account/pro-profile")
      .send({ businessName: "Ghost Business" });
    expect(res.statusCode).toBe(404);
  });

  it("updateProHeaderImage → 404 si utilisateur non trouvé", async () => {
    User.findById.mockResolvedValueOnce(null);
    const res = await request(app)
      .patch("/api/account/pro/header")
      .attach("file", Buffer.from("fake"), "fake.jpg");
    expect(res.statusCode).toBe(404);
  });

  it("updatePassword → 404 si utilisateur non trouvé", async () => {
    // 🧩 corrige le problème du .select()
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).patch("/api/account/password").send({
      currentPassword: "Password123!",
      newPassword: "NewPassword123!",
    });
    expect(res.statusCode).toBe(404);
  });
});
