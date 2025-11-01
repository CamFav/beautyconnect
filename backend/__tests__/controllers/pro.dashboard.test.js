const { getDashboard } = require('../../controllers/pro/dashboard.controller');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - pro.dashboard', () => {
  it('returns ok with user info', () => {
    const req = { user: { id: 'u1', role: 'pro' } };
    const res = mockRes();
    getDashboard(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok' }));
  });
});

