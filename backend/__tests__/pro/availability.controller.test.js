const ProDetails = require("../../models/ProDetails");
const {
  updateAvailability,
  getAvailability,
} = require("../../controllers/pro/availability.controller");

jest.mock("../../models/ProDetails");

describe("Pro Availability Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "pro123" },
      body: [],
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // --- updateAvailability ---
  describe("updateAvailability", () => {
    it("retourne 400 si le corps n'est pas un tableau", async () => {
      req.body = { invalid: true };

      await updateAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Format invalide : le corps doit être un tableau",
      });
    });

    it("retourne 400 si un élément est mal formé", async () => {
      req.body = [{ day: 1, slots: "bad" }];

      await updateAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "Chaque disponibilité doit contenir un day (string) et un tableau slots",
      });
    });

    it("met à jour les disponibilités avec succès", async () => {
      const mockData = {
        availability: [
          { day: "monday", slots: [{ start: "10:00", end: "12:00" }] },
        ],
      };
      ProDetails.findOneAndUpdate.mockResolvedValue(mockData);

      req.body = mockData.availability;

      await updateAvailability(req, res);

      expect(ProDetails.findOneAndUpdate).toHaveBeenCalledWith(
        { proId: "pro123" },
        { availability: mockData.availability },
        { new: true, upsert: true }
      );

      expect(res.json).toHaveBeenCalledWith({
        message: "Disponibilités mises à jour",
        availability: mockData.availability,
      });
    });

    it("gère une erreur serveur", async () => {
      ProDetails.findOneAndUpdate.mockRejectedValue(new Error("DB error"));

      req.body = [{ day: "monday", slots: [] }];

      await updateAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Erreur serveur" });
    });
  });

  // --- getAvailability ---
  describe("getAvailability", () => {
    it("retourne un tableau vide si aucun ProDetails", async () => {
      ProDetails.findOne.mockResolvedValue(null);

      await getAvailability(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("retourne les disponibilités existantes", async () => {
      const mockData = { availability: [{ day: "tuesday", slots: [] }] };
      ProDetails.findOne.mockResolvedValue(mockData);

      await getAvailability(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData.availability);
    });

    it("gère une erreur serveur", async () => {
      ProDetails.findOne.mockRejectedValue(new Error("DB error"));

      await getAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Erreur serveur" });
    });
  });
});
