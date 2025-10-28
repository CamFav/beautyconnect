// __tests__/users/users.avatar.test.js
const request = require("supertest");
const app = require("../../../app");
const path = require("path");
const fs = require("fs");

jest.mock("cloudinary");

describe("Users routes - Upload avatar", () => {
  let token;
  const fixturePath = path.resolve(__dirname, "../fixtures/fake-image.jpg");

  beforeAll(() => {
    // Vérifie que le fichier de test existe avant de lancer Supertest
    if (!fs.existsSync(fixturePath)) {
      throw new Error(
        `Le fichier de test d'image est introuvable : ${fixturePath}`
      );
    }
  });

  beforeEach(async () => {
    const email = `avatar_${Date.now()}@example.com`;

    await request(app).post("/api/auth/register").send({
      name: "Avatar User",
      email,
      password: "Password123!",
    });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Password123!" });

    token = login.body.token;
  });

  it("upload un avatar pour le rôle client", async () => {
    const res = await request(app)
      .patch("/api/users/client/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", fixturePath);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Avatar mis à jour avec succès");
    expect(res.body.user).toHaveProperty("avatarClient");
    expect(res.body.user.avatarClient).toMatch(/^https:\/\/mock\.cloudinary/);
  });

  it("upload un avatar pour le rôle pro", async () => {
    const res = await request(app)
      .patch("/api/users/pro/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", fixturePath);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("avatarPro");
    expect(res.body.user.avatarPro).toMatch(/^https:\/\/mock\.cloudinary/);
  });

  it("retourne 400 si le rôle est invalide", async () => {
    const res = await request(app)
      .patch("/api/users/unknown/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", fixturePath);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Rôle invalide/i);
  });

  it("retourne 400 si aucun fichier n’est envoyé", async () => {
    const res = await request(app)
      .patch("/api/users/client/avatar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Aucun fichier/i);
  });
});
