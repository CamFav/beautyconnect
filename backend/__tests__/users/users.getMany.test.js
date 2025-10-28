// __tests__/users/users.getMany.test.js
const request = require("supertest");
const app = require("../../../app");

describe("Users routes - GET /me/following & /?ids", () => {
  let tokenUser1, tokenUser2, user1, user2, user3;

  beforeEach(async () => {
    // Crée trois utilisateurs
    const register1 = await request(app)
      .post("/api/auth/register")
      .send({
        name: "User One",
        email: `u1_${Date.now()}@example.com`,
        password: "Password123!",
      });
    const register2 = await request(app)
      .post("/api/auth/register")
      .send({
        name: "User Two",
        email: `u2_${Date.now()}@example.com`,
        password: "Password123!",
      });
    const register3 = await request(app)
      .post("/api/auth/register")
      .send({
        name: "User Three",
        email: `u3_${Date.now()}@example.com`,
        password: "Password123!",
      });

    user1 = register1.body.user;
    user2 = register2.body.user;
    user3 = register3.body.user;

    // Connecte le premier utilisateur
    const login1 = await request(app)
      .post("/api/auth/login")
      .send({ email: user1.email, password: "Password123!" });

    tokenUser1 = login1.body.token;

    // Connecte un second pour plus tard
    const login2 = await request(app)
      .post("/api/auth/login")
      .send({ email: user2.email, password: "Password123!" });

    tokenUser2 = login2.body.token;

    // User1 suit User2
    await request(app)
      .post(`/api/users/${user2.id}/follow`)
      .set("Authorization", `Bearer ${tokenUser1}`);
  });

  // ========================
  // GET /api/users/me/following
  // ========================
  it("retourne la liste des users suivis par l'utilisateur connecté", async () => {
    const res = await request(app)
      .get("/api/users/me/following")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("following");
    expect(Array.isArray(res.body.following)).toBe(true);
    expect(res.body.following.length).toBe(1);
  });

  it("refuse sans token", async () => {
    const res = await request(app).get("/api/users/me/following");
    expect(res.statusCode).toBe(401);
  });

  // ========================
  // GET /api/users?ids=...
  // ========================
  it("retourne plusieurs utilisateurs à partir d'ids", async () => {
    const ids = `${user1.id},${user2.id},${user3.id}`;
    const res = await request(app)
      .get(`/api/users?ids=${ids}`)
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toHaveProperty("name");
  });

  it("retourne 400 si aucun id n’est fourni", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Aucun ID/i);
  });
});
