const { getDashboard } = require('../../controllers/pro/dashboard.controller');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - pro.dashboard branches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with user info (happy path)', () => {
    const res = resMock();
    getDashboard({ user: { id: 'u1', role: 'pro' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok' }));
  });

  it('catches error and returns 500 (exercise catch + console branch)', () => {
    const res = resMock();
    let first = true;
    res.json = jest.fn(() => {
      if (first) { first = false; throw new Error('boom'); }
      return res;
    });
    const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getDashboard({ user: { id: 'u1', role: 'pro' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(logSpy).toHaveBeenCalled();
  });

  it('fills defaults when req.user missing', () => {
    const res = resMock();
    getDashboard({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.user).toEqual(expect.objectContaining({ id: null, role: 'unknown' }));
  });
});
