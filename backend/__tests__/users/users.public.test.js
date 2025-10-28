const request = require("supertest");
const app = require("../../../app");

describe("Users routes - Public & Check Email", () => {
  let token, user;

  beforeEach(async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Public User",
        email: `public_${Date.now()}@example.com`,
        password: "Password123!",
      });

    user = register.body.user;

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "Password123!" });

    token = login.body.token;
  });

  // ========================================
  // GET /api/users/check-email
  // ========================================
  it("indique qu’un email est déjà utilisé", async () => {
    const res = await request(app).get(
      `/api/users/check-email?email=${user.email}`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("exists", true);
  });

  it("indique qu’un email est libre", async () => {
    const res = await request(app).get(
      `/api/users/check-email?email=new_${Date.now()}@example.com`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("exists", false);
  });

  it("retourne 400 si aucun email n’est fourni", async () => {
    const res = await request(app).get("/api/users/check-email");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Email manquant/i);
  });

  // ========================================
  // GET /api/users/:id/public
  // ========================================
  it("retourne le profil public d’un utilisateur", async () => {
    const res = await request(app).get(`/api/users/${user.id}/public`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).not.toHaveProperty("password");
    expect(res.body.user).not.toHaveProperty("email");
  });

  it("retourne 404 si l’utilisateur n’existe pas", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app).get(`/api/users/${fakeId}/public`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/introuvable/i);
  });

  // ========================================
  // GET /api/users/:id (auth requis)
  // ========================================
  it("retourne les infos d’un utilisateur spécifique avec auth", async () => {
    const res = await request(app)
      .get(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("name", user.name);
  });

  it("refuse sans token", async () => {
    const res = await request(app).get(`/api/users/${user.id}`);
    expect(res.statusCode).toBe(401);
  });

  it("retourne 404 si l’utilisateur n’existe pas", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .get(`/api/users/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});
