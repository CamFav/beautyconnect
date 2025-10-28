const Reservation = require("../../models/Reservation");
const ProDetails = require("../../models/ProDetails");
const {
  createReservation,
  getByClient,
  getByPro,
  updateStatus,
} = require("../../controllers/reservations/reservation.controller");

jest.mock("../../models/Reservation");
jest.mock("../../models/ProDetails");

describe("Reservation Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "client123" },
      body: {},
      params: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // ======================================================
  // CREATE RESERVATION
  // ======================================================
  describe("createReservation", () => {
    it("retourne 400 si champs requis manquants", async () => {
      req.body = {};
      await createReservation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("retourne 400 si la date est invalide", async () => {
      req.body = {
        proId: "p1",
        serviceId: "s1",
        date: "invalid",
        time: "10:00",
      };
      await createReservation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Date invalide (format attendu: YYYY-MM-DD)",
      });
    });

    it("retourne 400 si l'heure est invalide", async () => {
      req.body = {
        proId: "p1",
        serviceId: "s1",
        date: "2025-05-10",
        time: "invalid",
      };
      await createReservation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Heure invalide (format attendu: HH:MM)",
      });
    });

    it("retourne 404 si le pro n'existe pas", async () => {
      req.body = {
        proId: "p1",
        serviceId: "s1",
        date: "2025-05-10",
        time: "10:00",
      };
      ProDetails.findOne.mockResolvedValue(null);
      await createReservation(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("retourne 404 si le service n'existe pas", async () => {
      const mockDetails = { services: { id: jest.fn().mockReturnValue(null) } };
      ProDetails.findOne.mockResolvedValue(mockDetails);
      req.body = {
        proId: "p1",
        serviceId: "s1",
        date: "2025-05-10",
        time: "10:00",
      };
      await createReservation(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("retourne 400 si le créneau demandé n'est pas dispo", async () => {
      const mockService = { name: "Coiffure", price: 50, duration: 30 };
      const mockDetails = {
        services: { id: jest.fn().mockReturnValue(mockService) },
        availability: [
          {
            day: "monday", // le test tombe un samedi
            enabled: true,
            slots: [{ start: "09:00", end: "12:00" }],
          },
        ],
      };
      ProDetails.findOne.mockResolvedValue(mockDetails);

      req.body = {
        proId: "p1",
        serviceId: "s1",
        date: "2025-05-10",
        time: "10:00",
      };

      await createReservation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Ce créneau n'est pas disponible dans les horaires du pro",
      });
    });

    it("retourne 400 si le créneau est déjà réservé", async () => {
      const mockService = { name: "Coiffure", price: 50, duration: 30 };
      const mockDetails = {
        services: { id: jest.fn().mockReturnValue(mockService) },
        availability: [
          {
            day: "saturday",
            enabled: true,
            slots: [{ start: "09:00", end: "12:00" }],
          },
        ],
      };

      ProDetails.findOne.mockResolvedValue(mockDetails);
      Reservation.findOne.mockResolvedValue({ id: "existing" });

      req.body = {
        proId: "p1",
        serviceId: "s1",
        date: "2025-05-10",
        time: "10:00",
      };

      await createReservation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Ce créneau est déjà réservé",
      });
    });

    it("crée une réservation avec succès", async () => {
      const mockService = { name: "Coiffure", price: 50, duration: 30 };
      const mockDetails = {
        services: { id: jest.fn().mockReturnValue(mockService) },
        availability: [
          {
            day: "saturday",
            enabled: true,
            slots: [{ start: "09:00", end: "12:00" }],
          },
        ],
      };

      ProDetails.findOne.mockResolvedValue(mockDetails);
      Reservation.findOne.mockResolvedValue(null);
      Reservation.create.mockResolvedValue({
        id: "r1",
        proId: "p1",
        clientId: "client123",
        time: "10:00",
      });

      req.body = {
        proId: "p1",
        serviceId: "s1",
        date: "2025-05-10",
        time: "10:00",
      };

      await createReservation(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "r1",
          proId: "p1",
          clientId: "client123",
        })
      );
    });

    it("gère une erreur serveur", async () => {
      ProDetails.findOne.mockRejectedValue(new Error("DB fail"));
      req.body = {
        proId: "p1",
        serviceId: "s1",
        date: "2025-05-10",
        time: "10:00",
      };
      await createReservation(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ======================================================
  // GET BY CLIENT
  // ======================================================
  describe("getByClient", () => {
    it("retourne les réservations du client", async () => {
      const mockReservations = [{ id: "r1" }, { id: "r2" }];

      Reservation.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockReservations),
      });

      req.params.clientId = "client123";

      await getByClient(req, res);
      expect(res.json).toHaveBeenCalledWith(mockReservations);
    });

    it("gère une erreur serveur", async () => {
      Reservation.find.mockImplementation(() => {
        throw new Error("DB fail");
      });
      await getByClient(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ======================================================
  // GET BY PRO
  // ======================================================
  describe("getByPro", () => {
    it("retourne les réservations du pro", async () => {
      const mockReservations = [{ id: "r1" }];
      Reservation.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockReservations),
      });

      req.params.proId = "pro1";
      await getByPro(req, res);
      expect(res.json).toHaveBeenCalledWith(mockReservations);
    });

    it("gère une erreur serveur", async () => {
      Reservation.find.mockImplementation(() => {
        throw new Error("DB fail");
      });
      await getByPro(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ======================================================
  // UPDATE STATUS
  // ======================================================
  describe("updateStatus", () => {
    it("retourne 404 si réservation introuvable", async () => {
      Reservation.findByIdAndUpdate.mockResolvedValue(null);
      req.params.id = "r1";
      req.body.status = "confirmed";

      await updateStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("met à jour une réservation", async () => {
      const mockRes = { id: "r1", status: "confirmed" };
      Reservation.findByIdAndUpdate.mockResolvedValue(mockRes);

      req.params.id = "r1";
      req.body.status = "confirmed";

      await updateStatus(req, res);
      expect(res.json).toHaveBeenCalledWith(mockRes);
    });

    it("gère une erreur serveur", async () => {
      Reservation.findByIdAndUpdate.mockRejectedValue(new Error("DB fail"));
      await updateStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
