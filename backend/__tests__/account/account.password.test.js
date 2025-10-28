const request = require("supertest");
const app = require("../../../app");

describe("Account Controller - PATCH /api/account/password", () => {
  let token, email, password;

  beforeEach(async () => {
    email = `pwd_${Date.now()}@example.com`;
    password = "Password123!";

    await request(app).post("/api/auth/register").send({
      name: "Pwd User",
      email,
      password,
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    token = loginRes.body.token;
  });

  it("met à jour le mot de passe avec succès", async () => {
    const res = await request(app)
      .patch("/api/account/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: password,
        newPassword: "NewPassword123!",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Mot de passe mis à jour/i);

    // Vérifie que l’ancien mot de passe ne marche plus
    const failLogin = await request(app)
      .post("/api/auth/login")
      .send({ email, password }); // ancien

    expect(failLogin.statusCode).toBe(401);

    // Vérifie que le nouveau fonctionne
    const successLogin = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "NewPassword123!" });

    expect(successLogin.statusCode).toBe(200);
    expect(successLogin.body).toHaveProperty("token");
  });

  it("refuse si les champs sont manquants", async () => {
    const res = await request(app)
      .patch("/api/account/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: password });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("newPassword");
  });

  it("refuse un mot de passe faible", async () => {
    const res = await request(app)
      .patch("/api/account/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: password,
        newPassword: "abc",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("newPassword");
  });

  it("refuse si le mot de passe actuel est incorrect", async () => {
    const res = await request(app)
      .patch("/api/account/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "WrongPassword123!",
        newPassword: "AnotherPwd123!",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.errors[0].field).toBe("currentPassword");
  });

  it("refuse sans token", async () => {
    const res = await request(app).patch("/api/account/password").send({
      currentPassword: password,
      newPassword: "NewPassword123!",
    });

    expect(res.statusCode).toBe(401);
  });
});
