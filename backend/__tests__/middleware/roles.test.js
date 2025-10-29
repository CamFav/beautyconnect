const roles = require('../../middleware/roles');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Middleware - roles', () => {
  it('401 when req.user missing', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();
    roles('pro')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('403 when role not allowed', () => {
    const req = { user: { role: 'client' } };
    const res = mockRes();
    const next = jest.fn();
    roles(['pro'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('next when role allowed', () => {
    const req = { user: { role: 'pro' } };
    const res = mockRes();
    const next = jest.fn();
    roles(['pro','client'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

