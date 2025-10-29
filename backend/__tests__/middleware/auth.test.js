const jwt = require('jsonwebtoken');
const { protect } = require('../../middleware/auth');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Middleware - auth.protect', () => {
  it('401 when missing Authorization header', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('401 when invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid' } };
    const res = mockRes();
    const next = jest.fn();
    protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('injects req.user and calls next on valid token', () => {
    const token = jwt.sign({ sub: 'u1', email: 't@e.com', activeRole: 'pro' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    protect(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(expect.objectContaining({ id: 'u1', role: 'pro' }));
  });
});

