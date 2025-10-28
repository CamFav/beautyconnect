const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const User = require("../../models/User");

describe("Account Controller - DELETE /api/account/delete", () => {
  let token;
  let email = `delete_${Date.now()}@example.com`;
  const password = "Password123!";

  beforeEach(async () => {
    // Inscription
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Delete User", email, password });

    // Connexion
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    token = login.body.token;
  });

  it("supprime le compte avec succès", async () => {
    const res = await request(app)
      .delete("/api/account/delete")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Compte supprimé avec succès/i);

    // Vérifie que l'utilisateur n'existe plus en base
    const user = await User.findOne({ email });
    expect(user).toBeNull();

    // Vérifie qu'on ne peut plus se connecter
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(loginRes.statusCode).toBe(400);
  });

  it("refuse la suppression sans token", async () => {
    const res = await request(app).delete("/api/account/delete");
    expect(res.statusCode).toBe(401);
  });

  it("retourne 404 si l’utilisateur n’existe plus", async () => {
    // Supprime manuellement l’utilisateur avant la requête
    await User.deleteOne({ email });

    const res = await request(app)
      .delete("/api/account/delete")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("retourne 500 si une erreur serveur survient pendant la suppression", async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Crash Delete",
        email: `crashdelete_${Date.now()}@example.com`,
        password: "Password123!",
      });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: register.body.user.email, password: "Password123!" });

    const User = require("../../models/User");
    jest.spyOn(User, "findById").mockRejectedValueOnce(new Error("DB crash"));

    const res = await request(app)
      .delete("/api/account/delete")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(res.statusCode).toBe(500);
  });
});
