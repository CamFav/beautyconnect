const request = require("supertest");
const app = require("../../../app");

describe("POST /api/auth/register", () => {
  it("crée un nouvel utilisateur et retourne ses infos", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: `user_${Date.now()}@example.com`,
        password: "Password123!",
        name: "John Doe",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Utilisateur créé avec succès");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("refuse un email déjà utilisé", async () => {
    const email = `dup_${Date.now()}@example.com`;

    // Création du premier utilisateur
    await request(app).post("/api/auth/register").send({
      email,
      password: "Password123!",
      name: "Jane Doe",
    });

    // Tentative de doublon
    const res = await request(app).post("/api/auth/register").send({
      email,
      password: "Password123!",
      name: "Jane 2",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("email");
  });

  it("refuse une payload invalide", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "invalid",
      password: "123",
      name: "x",
    });

    expect([400, 422]).toContain(res.statusCode);
  });
});
