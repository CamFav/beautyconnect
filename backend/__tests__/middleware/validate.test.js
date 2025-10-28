const { validationResult } = require("express-validator");
const validate = require("../../middleware/validate");

jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

describe("Middleware - validate", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("retourne 400 si des erreurs de validation existent", () => {
    const mockErrors = {
      isEmpty: jest.fn().mockReturnValue(false),
      array: jest
        .fn()
        .mockReturnValue([{ msg: "Invalid email", param: "email" }]),
    };
    validationResult.mockReturnValue(mockErrors);

    validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ msg: "Invalid email", param: "email" }],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("appelle next() si aucune erreur", () => {
    const mockErrors = {
      isEmpty: jest.fn().mockReturnValue(true),
    };
    validationResult.mockReturnValue(mockErrors);

    validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
