const request = require("supertest");
const app = require("../../../app");

describe("GET /api/auth/me", () => {
  let token;
  let email;

  beforeEach(async () => {
    email = `me_${Date.now()}@example.com`;

    await request(app).post("/api/auth/register").send({
      email,
      password: "Password123!",
      name: "Test Me",
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Password123!" });

    token = loginRes.body.token;
  });

  it("retourne le profil utilisateur avec un token valide", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email", email);
    expect(res.body).not.toHaveProperty("password");
  });

  it("refuse l’accès sans token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("refuse l’accès avec un token invalide", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token");
    expect([401, 403]).toContain(res.statusCode);
  });
});
