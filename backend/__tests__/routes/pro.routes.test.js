const express = require("express");
const request = require("supertest");

jest.mock("../../middleware/auth", () => ({
  protect: (req, res, next) => {
    req.user = { id: "mockUserId", role: "pro" };
    next();
  },
}));

jest.mock("../../middleware/roles", () => () => (req, res, next) => next());
jest.mock("../../middleware/validate", () => (req, res, next) => next());

// Mock des contrôleurs
const servicesController = require("../../controllers/pro/services.controller");
const availabilityController = require("../../controllers/pro/availability.controller");
const slotsController = require("../../controllers/pro/slots.controller");
const { getDashboard } = require("../../controllers/pro/dashboard.controller");

jest.mock("../../controllers/pro/dashboard.controller", () => ({
  getDashboard: jest.fn((req, res) => res.json({ route: "dashboard" })),
}));

jest.mock("../../controllers/pro/services.controller", () => ({
  getMyServices: jest.fn((req, res) => res.json({ route: "getMyServices" })),
  createService: jest.fn((req, res) => res.json({ route: "createService" })),
  updateService: jest.fn((req, res) => res.json({ route: "updateService" })),
  deleteService: jest.fn((req, res) => res.json({ route: "deleteService" })),
  getPublicServices: jest.fn((req, res) =>
    res.json({ route: "getPublicServices" })
  ),
}));

jest.mock("../../controllers/pro/availability.controller", () => ({
  updateAvailability: jest.fn((req, res) =>
    res.json({ route: "updateAvailability" })
  ),
  getAvailability: jest.fn((req, res) =>
    res.json({ route: "getAvailability" })
  ),
}));

jest.mock("../../controllers/pro/slots.controller", () => ({
  getAvailableSlots: jest.fn((req, res) =>
    res.json({ route: "getAvailableSlots" })
  ),
}));

const router = require("../../routes/pro.routes");
const app = express();
app.use(express.json());
app.use("/api/pro", router);

describe("Pro Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Dashboard
  it("GET /dashboard appelle getDashboard", async () => {
    const res = await request(app).get("/api/pro/dashboard");
    expect(res.statusCode).toBe(200);
    expect(res.body.route).toBe("dashboard");
    expect(getDashboard).toHaveBeenCalled();
  });

  // Services
  it("GET /services appelle getMyServices", async () => {
    const res = await request(app).get("/api/pro/services");
    expect(res.body.route).toBe("getMyServices");
    expect(servicesController.getMyServices).toHaveBeenCalled();
  });

  it("POST /services appelle createService", async () => {
    const res = await request(app)
      .post("/api/pro/services")
      .send({ name: "test", price: 10, duration: 30 });
    expect(res.body.route).toBe("createService");
    expect(servicesController.createService).toHaveBeenCalled();
  });

  it("PUT /services/:serviceId appelle updateService", async () => {
    const res = await request(app)
      .put("/api/pro/services/507f1f77bcf86cd799439011")
      .send({ name: "modifié" });
    expect(res.body.route).toBe("updateService");
    expect(servicesController.updateService).toHaveBeenCalled();
  });

  it("DELETE /services/:serviceId appelle deleteService", async () => {
    const res = await request(app).delete(
      "/api/pro/services/507f1f77bcf86cd799439011"
    );
    expect(res.body.route).toBe("deleteService");
    expect(servicesController.deleteService).toHaveBeenCalled();
  });

  it("GET /:proId/services/public appelle getPublicServices", async () => {
    const res = await request(app).get(
      "/api/pro/507f1f77bcf86cd799439011/services/public"
    );
    expect(res.body.route).toBe("getPublicServices");
    expect(servicesController.getPublicServices).toHaveBeenCalled();
  });

  // Availability
  it("PUT /availability appelle updateAvailability", async () => {
    const res = await request(app)
      .put("/api/pro/availability")
      .send([{ day: "monday", slots: [] }]);
    expect(res.body.route).toBe("updateAvailability");
    expect(availabilityController.updateAvailability).toHaveBeenCalled();
  });

  it("GET /availability appelle getAvailability", async () => {
    const res = await request(app).get("/api/pro/availability");
    expect(res.body.route).toBe("getAvailability");
    expect(availabilityController.getAvailability).toHaveBeenCalled();
  });

  // Slots
  it("GET /:proId/slots appelle getAvailableSlots", async () => {
    const res = await request(app).get(
      "/api/pro/507f1f77bcf86cd799439011/slots"
    );
    expect(res.body.route).toBe("getAvailableSlots");
    expect(slotsController.getAvailableSlots).toHaveBeenCalled();
  });
});
