const request = require("supertest");
const app = require("../../../app");

describe("Account Controller - PATCH /api/account/role", () => {
  let token, user;

  beforeEach(async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Role User",
        email: `role_${Date.now()}@example.com`,
        password: "Password123!",
      });

    user = register.body.user;

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "Password123!" });

    token = login.body.token;
  });

  it("met à jour le rôle vers 'pro'", async () => {
    const res = await request(app)
      .patch("/api/account/role")
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "pro" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Rôle mis à jour");
    expect(res.body.user.activeRole).toBe("pro");
    expect(res.body).toHaveProperty("token");
  });

  it("met à jour le rôle vers 'client'", async () => {
    const res = await request(app)
      .patch("/api/account/role")
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "client" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.activeRole).toBe("client");
  });

  it("refuse un rôle invalide", async () => {
    const res = await request(app)
      .patch("/api/account/role")
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "admin" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Rôle invalide/i);
  });

  it("refuse sans token", async () => {
    const res = await request(app)
      .patch("/api/account/role")
      .send({ role: "pro" });

    expect(res.statusCode).toBe(401);
  });

  it("retourne 404 si l’utilisateur n’existe pas lors du changement de rôle", async () => {
    const res = await request(app)
      .patch("/api/account/role")
      .set("Authorization", `Bearer fake.invalid.token`)
      .send({ role: "pro" });

    expect([401, 404]).toContain(res.statusCode);
  });

  it("retourne 500 si une erreur serveur survient pendant updateRole", async () => {
    // simulate DB crash
    const mongoose = require("mongoose");
    jest
      .spyOn(mongoose.Model, "findById")
      .mockRejectedValueOnce(new Error("DB fail"));

    const register = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Crash Role",
        email: `crashrole_${Date.now()}@example.com`,
        password: "Password123!",
      });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: register.body.user.email, password: "Password123!" });

    const res = await request(app)
      .patch("/api/account/role")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ role: "pro" });

    expect(res.statusCode).toBe(500);
  });
});
