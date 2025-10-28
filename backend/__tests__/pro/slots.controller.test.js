const ProDetails = require("../../models/ProDetails");
const Reservation = require("../../models/Reservation");
const { getAvailableSlots } = require("../../controllers/pro/slots.controller");

jest.mock("../../models/ProDetails");
jest.mock("../../models/Reservation");

describe("Pro Slots Controller - getAvailableSlots", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { proId: "pro123" },
      query: { date: "2025-05-10", serviceId: "srv1" },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("retourne 400 si la date est manquante", async () => {
    req.query.date = undefined;
    await getAvailableSlots(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "date (YYYY-MM-DD) is required",
    });
  });

  it("retourne 400 si le serviceId est manquant", async () => {
    req.query.serviceId = undefined;
    await getAvailableSlots(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "serviceId is required" });
  });

  it("retourne 400 pour un format de date invalide", async () => {
    req.query.date = "invalid-date";
    await getAvailableSlots(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid date format. Expected YYYY-MM-DD",
    });
  });

  it("retourne 404 si le pro n'existe pas", async () => {
    ProDetails.findOne.mockResolvedValue(null);
    await getAvailableSlots(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Pro not found" });
  });

  it("retourne 404 si le service n'existe pas", async () => {
    ProDetails.findOne.mockResolvedValue({
      services: { id: jest.fn().mockReturnValue(null) },
    });
    await getAvailableSlots(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Service not found" });
  });

  it("retourne 400 si la durée du service est invalide", async () => {
    const mockService = { duration: "invalid" };
    ProDetails.findOne.mockResolvedValue({
      services: { id: jest.fn().mockReturnValue(mockService) },
    });
    await getAvailableSlots(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid service duration",
    });
  });

  it("retourne un tableau vide si aucune disponibilité", async () => {
    const mockService = { duration: 60 };
    ProDetails.findOne.mockResolvedValue({
      services: { id: jest.fn().mockReturnValue(mockService) },
      availability: [],
    });
    await getAvailableSlots(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("retourne un tableau vide si aucun créneau dispo ce jour-là", async () => {
    const mockService = { duration: 30 };
    ProDetails.findOne.mockResolvedValue({
      services: { id: jest.fn().mockReturnValue(mockService) },
      availability: [{ day: "monday", slots: [] }], // mais la date ne tombe pas lundi
    });
    await getAvailableSlots(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("retourne les créneaux disponibles en retirant les réservés", async () => {
    const mockService = { duration: 60 };
    const mockAvailability = [
      {
        day: "saturday", // correspond au 2025-05-10
        slots: [{ start: "10:00", end: "12:00" }],
      },
    ];

    ProDetails.findOne.mockResolvedValue({
      services: { id: jest.fn().mockReturnValue(mockService) },
      availability: mockAvailability,
    });

    Reservation.find.mockResolvedValue([
      { time: "10:00" }, // réservé
    ]);

    await getAvailableSlots(req, res);

    expect(res.json).toHaveBeenCalledWith(["11:00"]); // reste seulement ce créneau
  });

  it("gère une erreur serveur proprement", async () => {
    ProDetails.findOne.mockRejectedValue(new Error("DB fail"));
    await getAvailableSlots(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur serveur" });
  });
});
