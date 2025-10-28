const jwt = require("jsonwebtoken");
const { protect } = require("../../middleware/auth");

jest.mock("jsonwebtoken");

describe("Middleware - auth.protect", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = "testsecret";
  });

  it("retourne 401 si le header Authorization est manquant", () => {
    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Accès refusé: token manquant ou mal formé",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retourne 401 si le header ne commence pas par Bearer", () => {
    req.headers.authorization = "Token abc";
    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Accès refusé: token manquant ou mal formé",
    });
  });

  it("retourne 401 si jwt.verify échoue (token invalide)", () => {
    req.headers.authorization = "Bearer badtoken";
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid");
    });

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token invalide" });
  });

  it("retourne 401 si le token est expiré", () => {
    req.headers.authorization = "Bearer expired";
    const error = new Error("expired");
    error.name = "TokenExpiredError";
    jwt.verify.mockImplementation(() => {
      throw error;
    });

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token expiré" });
  });

  it("retourne 401 si le token ne contient pas d'id", () => {
    req.headers.authorization = "Bearer validtoken";
    jwt.verify.mockReturnValue({ email: "test@example.com" });

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token invalide: identifiant utilisateur manquant",
    });
  });

  it("injecte req.user et appelle next() si tout est correct", () => {
    req.headers.authorization = "Bearer validtoken";
    jwt.verify.mockReturnValue({
      id: "123",
      email: "test@example.com",
      activeRole: "pro",
    });

    protect(req, res, next);

    expect(req.user).toEqual({
      id: "123",
      email: "test@example.com",
      role: "pro",
    });
    expect(next).toHaveBeenCalled();
  });
});
