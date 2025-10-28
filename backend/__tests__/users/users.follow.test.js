// __tests__/users/users.follow.test.js
const request = require("supertest");
const app = require("../../../app");

describe("Users routes - Follow / Unfollow", () => {
  let userA, userB;
  let tokenA, tokenB;

  beforeEach(async () => {
    // Créer deux utilisateurs distincts
    const registerA = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Follower A",
        email: `follower_${Date.now()}@example.com`,
        password: "Password123!",
      });

    const registerB = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Target B",
        email: `target_${Date.now()}@example.com`,
        password: "Password123!",
      });

    userA = registerA.body.user;
    userB = registerB.body.user;

    // Connexion pour obtenir leurs tokens
    const loginA = await request(app)
      .post("/api/auth/login")
      .send({ email: userA.email, password: "Password123!" });

    const loginB = await request(app)
      .post("/api/auth/login")
      .send({ email: userB.email, password: "Password123!" });

    tokenA = loginA.body.token;
    tokenB = loginB.body.token;
  });

  it("permet de suivre un autre utilisateur", async () => {
    const res = await request(app)
      .post(`/api/users/${userB.id}/follow`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Abonnement réussi");
    expect(res.body.following).toBe(true);
    expect(typeof res.body.followersCount).toBe("number");
  });

  it("permet de se désabonner (toggle du follow)", async () => {
    // Follow une première fois
    await request(app)
      .post(`/api/users/${userB.id}/follow`)
      .set("Authorization", `Bearer ${tokenA}`);

    // Deuxième requête = unfollow
    const res = await request(app)
      .post(`/api/users/${userB.id}/follow`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Désabonnement réussi");
    expect(res.body.following).toBe(false);
  });

  it("refuse qu’un utilisateur se suive lui-même", async () => {
    const res = await request(app)
      .post(`/api/users/${userA.id}/follow`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Impossible de se suivre soi-même");
  });

  it("retourne 404 si la cible n’existe pas", async () => {
    const res = await request(app)
      .post("/api/users/507f1f77bcf86cd799439011/follow")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/introuvable/i);
  });
});
