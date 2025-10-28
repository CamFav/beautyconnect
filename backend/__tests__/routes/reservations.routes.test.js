const express = require("express");
const request = require("supertest");

// Mock middlewares
const mockProtect = jest.fn((req, res, next) => {
  req.user = { id: "mockUserId", role: "client" };
  next();
});

jest.mock("../../middleware/auth", () => ({
  protect: mockProtect,
}));

jest.mock("../../middleware/roles", () => (role) => (req, res, next) => {
  req.requiredRole = role;
  next();
});

jest.mock("../../middleware/validate", () => (req, res, next) => next());

// Mock contrôleurs
const reservationController = require("../../controllers/reservations/reservation.controller");
jest.mock("../../controllers/reservations/reservation.controller", () => ({
  createReservation: jest.fn((req, res) =>
    res.json({ route: "createReservation" })
  ),
  getByClient: jest.fn((req, res) => res.json({ route: "getByClient" })),
  getByPro: jest.fn((req, res) => res.json({ route: "getByPro" })),
  updateStatus: jest.fn((req, res) => res.json({ route: "updateStatus" })),
}));

const router = require("../../routes/reservations.routes");
const app = express();
app.use(express.json());
app.use("/api/reservations", router);

describe("Reservations Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // POST /api/reservations
  // ========================================
  it("POST / appelle createReservation", async () => {
    const res = await request(app).post("/api/reservations").send({
      serviceId: "507f1f77bcf86cd799439011",
      proId: "507f1f77bcf86cd799439012",
      date: "2025-12-12",
      time: "10:00",
      location: "Paris",
      notes: "Test note",
      extra: "Non autorisé", // devrait être supprimé par allowOnly
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.route).toBe("createReservation");
    expect(reservationController.createReservation).toHaveBeenCalled();

    // Vérifie que le champ interdit n'est pas passé au contrôleur
    const bodySent =
      reservationController.createReservation.mock.calls[0][0].body;
    expect(bodySent.extra).toBeUndefined();
  });

  // ========================================
  // GET /api/reservations/client/:clientId
  // ========================================
  it("GET /client/:clientId retourne 403 si user différent", async () => {
    const res = await request(app).get(
      "/api/reservations/client/507f1f77bcf86cd799439099"
    );
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Accès refusé/);
  });

  it("GET /client/:clientId appelle getByClient si bon utilisateur", async () => {
    const res = await request(app).get("/api/reservations/client/mockUserId");
    expect(res.statusCode).toBe(200);
    expect(res.body.route).toBe("getByClient");
    expect(reservationController.getByClient).toHaveBeenCalled();
  });

  // ========================================
  // GET /api/reservations/pro/:proId
  // ========================================
  it("GET /pro/:proId retourne 403 si user différent", async () => {
    const res = await request(app).get(
      "/api/reservations/pro/507f1f77bcf86cd799439099"
    );
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Accès refusé/);
  });

  it("GET /pro/:proId appelle getByPro si user match", async () => {
    // On fait croire que le user est un pro
    const { protect } = require("../../middleware/auth");
    protect.mockImplementationOnce((req, res, next) => {
      req.user = { id: "mockUserId", role: "pro" };
      next();
    });

    const res = await request(app).get("/api/reservations/pro/mockUserId");
    expect(res.statusCode).toBe(200);
    expect(res.body.route).toBe("getByPro");
    expect(reservationController.getByPro).toHaveBeenCalled();
  });

  // ========================================
  // PATCH /api/reservations/:id/status
  // ========================================
  it("PATCH /:id/status appelle updateStatus", async () => {
    const res = await request(app)
      .patch("/api/reservations/507f1f77bcf86cd799439011/status")
      .send({ status: "confirmed", badField: "nope" });

    expect(res.statusCode).toBe(200);
    expect(res.body.route).toBe("updateStatus");
    expect(reservationController.updateStatus).toHaveBeenCalled();

    const bodySent = reservationController.updateStatus.mock.calls[0][0].body;
    expect(bodySent.badField).toBeUndefined(); // le champ doit être nettoyé
  });
});
