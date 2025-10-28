const ProDetails = require("../../models/ProDetails");
const {
  getMyServices,
  createService,
  updateService,
  deleteService,
  getPublicServices,
} = require("../../controllers/pro/services.controller");

jest.mock("../../models/ProDetails");

describe("Pro Services Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: "pro123" }, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // ===============================
  // GET my services
  // ===============================
  describe("getMyServices", () => {
    // --- getMyServices ---
    it("retourne un tableau vide si aucun service trouvé", async () => {
      ProDetails.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await getMyServices(req, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("retourne les services du pro", async () => {
      const mockData = { services: [{ name: "Coiffure" }] };
      ProDetails.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData),
      });

      await getMyServices(req, res);
      expect(res.json).toHaveBeenCalledWith(mockData.services);
    });

    // --- getPublicServices ---
    it("retourne un tableau vide si aucun service", async () => {
      ProDetails.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      req.params = { proId: "abc" };
      await getPublicServices(req, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("retourne les services publics", async () => {
      const mockPro = { services: [{ name: "Coiffure" }] };
      ProDetails.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPro),
      });

      req.params = { proId: "abc" };
      await getPublicServices(req, res);
      expect(res.json).toHaveBeenCalledWith(mockPro.services);
    });
  });

  // ===============================
  // CREATE service
  // ===============================
  describe("createService", () => {
    it("refuse si champs invalides", async () => {
      req.body = { name: "", price: "abc", duration: "xyz" };
      await createService(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("crée un service avec succès", async () => {
      const mockPro = { services: [], save: jest.fn() };
      ProDetails.findOne.mockResolvedValue(mockPro);

      req.body = {
        name: "Massage",
        price: 50,
        duration: 60,
        description: "Relaxant",
      };

      await createService(req, res);

      expect(mockPro.services.length).toBe(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Massage",
          price: 50,
          duration: 60,
        })
      );
    });

    it("gère une erreur serveur", async () => {
      ProDetails.findOne.mockRejectedValue(new Error("DB error"));
      req.body = { name: "Test", price: 10, duration: 30 };
      await createService(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ===============================
  // UPDATE service
  // ===============================
  describe("updateService", () => {
    it("retourne 404 si pro introuvable", async () => {
      ProDetails.findOne.mockResolvedValue(null);
      req.params = { serviceId: "123" };
      await updateService(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("retourne 404 si service introuvable", async () => {
      const mockPro = { services: { id: jest.fn().mockReturnValue(null) } };
      ProDetails.findOne.mockResolvedValue(mockPro);
      req.params = { serviceId: "123" };
      await updateService(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("met à jour un service avec succès", async () => {
      const mockService = { name: "Old", price: 10, duration: 30 };
      const mockPro = {
        services: { id: jest.fn().mockReturnValue(mockService) },
        save: jest.fn(),
      };
      ProDetails.findOne.mockResolvedValue(mockPro);

      req.params = { serviceId: "123" };
      req.body = { name: "New", price: 20 };

      await updateService(req, res);

      expect(mockService.name).toBe("New");
      expect(mockService.price).toBe(20);
      expect(res.json).toHaveBeenCalledWith(mockService);
    });
  });

  // ===============================
  // DELETE service
  // ===============================
  describe("deleteService", () => {
    it("retourne 404 si pro introuvable", async () => {
      ProDetails.findOne.mockResolvedValue(null);
      req.params = { serviceId: "abc" };
      await deleteService(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("retourne 404 si service introuvable", async () => {
      const mockPro = { services: [{ _id: "1" }], save: jest.fn() };
      ProDetails.findOne.mockResolvedValue(mockPro);
      req.params = { serviceId: "2" };
      await deleteService(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("supprime un service avec succès", async () => {
      const mockPro = {
        services: [{ _id: { toString: () => "1" } }],
        save: jest.fn(),
      };
      ProDetails.findOne.mockResolvedValue(mockPro);
      req.params = { serviceId: "1" };

      await deleteService(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Service supprimé avec succès.",
      });
    });
  });

  // ===============================
  // GET public services
  // ===============================
  describe("getPublicServices", () => {
    it("retourne un tableau vide si aucun service", async () => {
      ProDetails.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      req.params = { proId: "abc" };
      await getPublicServices(req, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("retourne les services publics", async () => {
      const mockPro = { services: [{ name: "Coiffure" }] };
      ProDetails.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPro),
      });

      req.params = { proId: "abc" };
      await getPublicServices(req, res);
      expect(res.json).toHaveBeenCalledWith(mockPro.services);
    });
  });
});
