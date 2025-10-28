const request = require("supertest");
const app = require("../../../app");

describe("POST /api/auth/login", () => {
  const email = `login_${Date.now()}@example.com`;
  const password = "Password123!";

  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      email,
      password,
      name: "Login User",
    });
  });

  it("connecte un utilisateur valide et retourne un token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", email);
  });

  it("refuse un mot de passe invalide", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "WrongPwd123" });

    expect(res.statusCode).toBe(401);
    expect(res.body.errors[0].field).toBe("password");
  });

  it("refuse une payload invalide", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "bademail",
      password: "",
    });
    expect([400, 422]).toContain(res.statusCode);
  });
});
