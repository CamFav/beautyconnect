const request = require("supertest");
const app = require("../../app");
const cloudinary = require("../../config/cloudinary");

jest.mock("../../config/cloudinary", () => ({
  uploader: {
    upload_stream: jest.fn((options, callback) => {
      return {
        end: () =>
          callback(null, { secure_url: "https://fakeimg.com/test.jpg" }),
      };
    }),
  },
}));

describe("Account Controller - PATCH /api/account/pro/header", () => {
  let token;

  beforeEach(async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Header User",
        email: `header_${Date.now()}@example.com`,
        password: "Password123!",
      });
    const login = await request(app).post("/api/auth/login").send({
      email: register.body.user.email,
      password: "Password123!",
    });
    token = login.body.token;
  });

  it("refuse sans fichier", async () => {
    const res = await request(app)
      .patch("/api/account/pro/header")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });

  it("retourne 500 si Cloudinary échoue", async () => {
    cloudinary.uploader.upload_stream.mockImplementationOnce((opts, cb) => {
      return { end: () => cb(new Error("upload error")) };
    });

    const res = await request(app)
      .patch("/api/account/pro/header")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("test"), "test.jpg");

    expect(res.statusCode).toBe(500);
    // Sécurise le test : on vérifie juste que la réponse contient un message ou pas
    expect(res.body).toBeDefined();
    if (res.body.message) {
      expect(typeof res.body.message).toBe("string");
    }
  });
});
