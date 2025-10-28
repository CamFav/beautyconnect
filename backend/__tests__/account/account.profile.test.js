const request = require("supertest");
const app = require("../../../app");

describe("Account Controller - PATCH /api/account/profile", () => {
  let token, user;

  beforeEach(async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Profile User",
        email: `profile_${Date.now()}@example.com`,
        password: "Password123!",
      });

    user = register.body.user;

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "Password123!" });

    token = login.body.token;
  });

  it("met à jour le profil avec succès", async () => {
    const res = await request(app)
      .patch("/api/account/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Name",
        email: `updated_${Date.now()}@example.com`,
        phone: "+33601020304",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Profil client mis à jour/i);
    expect(res.body.user).toHaveProperty("name", "Updated Name");
    expect(res.body.user).toHaveProperty("phone", "+33601020304");
  });

  it("refuse un nom invalide", async () => {
    const res = await request(app)
      .patch("/api/account/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "x" }); // trop court

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("name");
  });

  it("refuse un email invalide", async () => {
    const res = await request(app)
      .patch("/api/account/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "notanemail" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("email");
  });

  it("refuse un téléphone invalide", async () => {
    const res = await request(app)
      .patch("/api/account/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ phone: "abc123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe("phone");
  });

  it("refuse sans token", async () => {
    const res = await request(app)
      .patch("/api/account/profile")
      .send({ name: "Unauthorized" });

    expect(res.statusCode).toBe(401);
  });

  it("met à jour avec localisation valide", async () => {
    const res = await request(app)
      .patch("/api/account/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        location: {
          city: "Paris",
          country: "France",
          latitude: 48.8566,
          longitude: 2.3522,
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Profil client mis à jour/i);

    // Vérifie la mise à jour via /auth/me
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.proProfile).toBeDefined();
    expect(meRes.body.proProfile.location.city).toBe("Paris");
    expect(meRes.body.proProfile.location.country).toBe("France");
  });
});
