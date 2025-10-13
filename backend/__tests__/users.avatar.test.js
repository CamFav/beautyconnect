// Mocks AVANT imports
jest.mock("../middleware/auth", () => ({
  protect: (req, res, next) => {
    req.user = { id: "fakeUserId" };
    next();
  },
}));

// Variable autorisée pour Jest
let mockFile = null;

jest.mock("../middleware/upload", () => ({
  single: () => (req, res, next) => {
    req.file = mockFile;
    next();
  },
}));

// Mock User avec .select() supporté
const mockFindByIdAndUpdate = jest.fn();
jest.mock("../models/User", () => ({
  findByIdAndUpdate: (...args) => {
    const result = mockFindByIdAndUpdate(...args);
    return {
      select: () => result, // évite l'erreur .select is not a function
    };
  },
}));

// Mock Cloudinary
jest.mock("../config/cloudinary", () => {
  const mockUploadStream = jest.fn((options, cb) => {
    return {
      end: (buffer) => {
        mockUploadStream._end(buffer);
      },
    };
  });

  mockUploadStream._end = jest.fn();

  return {
    uploader: {
      upload_stream: (...args) => mockUploadStream(...args),
    },
    __mockUploadStream: mockUploadStream,
  };
});

// Import après les mocks
const request = require("supertest");
const app = require("../app");
const cloudinary = require("../config/cloudinary");
const mockUploadStream = cloudinary.__mockUploadStream;

describe("PATCH /api/users/:role/avatar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFile = null;
  });

  it("renvoie 400 si le rôle est invalide", async () => {
    const res = await request(app)
      .patch("/api/users/invalidRole/avatar")
      .send();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Rôle invalide (client ou pro requis)");
  });

  it("renvoie 400 si aucun fichier n'est fourni", async () => {
    mockFile = null; // Simule absence de fichier

    const res = await request(app)
      .patch("/api/users/client/avatar")
      .send();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Aucun fichier fourni");
  });

  it("met à jour l'avatar avec succès (Cloudinary OK)", async () => {
    mockFile = { buffer: Buffer.from("fake-img") };

    mockFindByIdAndUpdate.mockResolvedValueOnce({
      _id: "fakeUserId",
      avatarClient: "http://cloudinary.com/new-image.jpg",
    });

    mockUploadStream.mockImplementationOnce((options, cb) => {
      return {
        end: () => {
          cb(null, { secure_url: "http://cloudinary.com/new-image.jpg" });
        },
      };
    });

    const res = await request(app)
      .patch("/api/users/client/avatar")
      .send();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Avatar mis à jour avec succès");
    expect(res.body.user.avatarClient).toBe(
      "http://cloudinary.com/new-image.jpg"
    );
    expect(mockFindByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  it("renvoie 500 si Cloudinary échoue", async () => {
    mockFile = { buffer: Buffer.from("fake-img") };

    mockUploadStream.mockImplementationOnce((options, cb) => {
      return {
        end: () => {
          cb(new Error("Erreur Cloudinary"), null);
        },
      };
    });

    const res = await request(app)
      .patch("/api/users/client/avatar")
      .send();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur upload Cloudinary");
  });
});
