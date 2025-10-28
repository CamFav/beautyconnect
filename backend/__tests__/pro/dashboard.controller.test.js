const { getDashboard } = require("../../controllers/pro/dashboard.controller");

describe("Pro Dashboard Controller", () => {
  it("retourne un message de bienvenue", () => {
    const req = {};
    const res = {
      json: jest.fn(),
    };

    getDashboard(req, res);

    expect(res.json).toHaveBeenCalledWith({
      status: "ok",
      message: "Bienvenue sur le dashboard PRO",
    });
  });
});
