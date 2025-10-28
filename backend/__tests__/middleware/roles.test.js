const rolesMiddleware = require("../../middleware/roles");

describe("Middleware - roles.js", () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { role: "pro" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("autorise si le rôle correspond", () => {
    const middleware = rolesMiddleware("pro");
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("refuse si non authentifié", () => {
    req.user = null;
    const middleware = rolesMiddleware("pro");
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Non authentifié" });
    expect(next).not.toHaveBeenCalled();
  });

  it("refuse si le rôle est insuffisant", () => {
    req.user.role = "client";
    const middleware = rolesMiddleware("pro");
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Accès refusé: rôle insuffisant",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
