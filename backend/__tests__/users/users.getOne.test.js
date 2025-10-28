// __tests__/users/users.getOne.test.js
const request = require("supertest");
const app = require("../../../app");

describe("Users routes - GET one / check email", () => {
  let userId;
  let token;
  let email;

  beforeEach(async () => {
    email = `user_${Date.now()}@example.com`;

    // Création utilisateur
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email,
      password: "Password123!",
    });

    userId = registerRes.body.user.id;

    // Connexion pour obtenir token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Password123!" });

    token = loginRes.body.token;
  });

  // 1. Profil public
  it("retourne un profil public sans email ni password", async () => {
    const res = await request(app).get(`/api/users/${userId}/public`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("name");
    expect(res.body.user).not.toHaveProperty("email");
    expect(res.body.user).not.toHaveProperty("password");
  });

  // 2. Profil public inexistant
  it("retourne 404 pour un profil public inexistant", async () => {
    const res = await request(app).get(
      "/api/users/507f1f77bcf86cd799439011/public"
    );
    expect(res.statusCode).toBe(404);
  });

  // 3. Profil privé avec token
  it("retourne un profil complet avec un token valide", async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("email", email);
    expect(res.body.user).not.toHaveProperty("password");
  });

  // 4. Profil privé inexistant
  it("retourne 404 si le profil n'existe pas (token valide)", async () => {
    const res = await request(app)
      .get("/api/users/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  // 5. Vérification email existant
  it("retourne exists=true si l'email est déjà utilisé", async () => {
    const res = await request(app).get(`/api/users/check-email?email=${email}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("exists", true);
  });

  // 6. Vérification email manquant
  it("retourne 400 si aucun email n'est fourni", async () => {
    const res = await request(app).get("/api/users/check-email");
    expect(res.statusCode).toBe(400);
  });
});
