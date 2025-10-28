const request = require("supertest");
const app = require("../../../app");

describe("Account Controller - PATCH /api/account/pro-profile", () => {
  let token, email;

  beforeEach(async () => {
    email = `pro_${Date.now()}@example.com`;

    await request(app).post("/api/auth/register").send({
      name: "Pro User",
      email,
      password: "Password123!",
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Password123!" });

    token = loginRes.body.token;
  });

  it("met à jour le profil professionnel avec succès", async () => {
    const res = await request(app)
      .patch("/api/account/pro-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        businessName: "Salon Élégance",
        siret: "12345678901234",
        status: "freelance",
        experience: "2+ ans",
        categories: ["Coiffure", "Maquillage"],
        location: {
          city: "Toulouse",
          country: "France",
          latitude: 43.6045,
          longitude: 1.4442,
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Profil professionnel mis à jour/i);
    expect(res.body.user.proProfile.businessName).toBe("Salon Élégance");
    expect(res.body.user.proProfile.siret).toBe("12345678901234");
    expect(res.body.user.proProfile.location.city).toBe("Toulouse");
    expect(res.body.user.proProfile.categories).toContain("Coiffure");
  });

  it("refuse un SIRET invalide", async () => {
    const res = await request(app)
      .patch("/api/account/pro-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ siret: "123" }); // trop court

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("siret");
  });

  it("refuse une catégorie invalide", async () => {
    const res = await request(app)
      .patch("/api/account/pro-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ categories: ["Plomberie"] }); // non listée

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("categories");
  });

  it("refuse un statut invalide", async () => {
    const res = await request(app)
      .patch("/api/account/pro-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "autre" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("status");
  });

  it("refuse une localisation sans city/country", async () => {
    const res = await request(app)
      .patch("/api/account/pro-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        location: { address: "Rue Incomplète" }, // city/country manquants
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("location");
  });

  it("refuse sans token", async () => {
    const res = await request(app)
      .patch("/api/account/pro-profile")
      .send({ businessName: "Sans Auth" });

    expect(res.statusCode).toBe(401);
  });

  it("retourne 404 si l’utilisateur n’existe plus", async () => {
    const User = require("../../models/User");
    const register = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Ghost",
        email: `ghost_${Date.now()}@ex.com`,
        password: "Password123!",
      });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: register.body.user.email, password: "Password123!" });

    // Supprime le user
    await User.findByIdAndDelete(register.body.user.id);

    const res = await request(app)
      .patch("/api/account/pro-profile") // <- bonne route
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ businessName: "Updated Ghost" });

    expect(res.statusCode).toBe(404);
  });

  it("retourne 500 si une erreur serveur se produit pendant updateProfile", async () => {
    const User = require("../../models/User");
    jest.spyOn(User, "findById").mockRejectedValueOnce(new Error("DB crash"));

    const register = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Crash",
        email: `crash_${Date.now()}@ex.com`,
        password: "Password123!",
      });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: register.body.user.email, password: "Password123!" });

    const res = await request(app)
      .patch("/api/account/profile")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ name: "Will Fail" });

    expect(res.statusCode).toBe(500);
  });

  it("refuse une expérience invalide", async () => {
    const res = await request(app)
      .patch("/api/account/pro-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ experience: "30 ans" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("experience");
  });

  it("retourne 500 en cas d’erreur serveur lors de la mise à jour pro-profile", async () => {
    const User = require("../../models/User");
    jest.spyOn(User, "findById").mockRejectedValueOnce(new Error("DB crash"));

    const res = await request(app)
      .patch("/api/account/pro-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Crash Test" });

    expect(res.statusCode).toBe(500);
  });
});
