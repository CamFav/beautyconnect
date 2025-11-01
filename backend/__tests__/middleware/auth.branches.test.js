const jwt = require('jsonwebtoken');
const { protect } = require('../../middleware/auth');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Middleware - auth branches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when header missing or malformed', () => {
    const res = resMock();
    protect({ headers: {} }, res, () => {});
    expect(res.status).toHaveBeenCalledWith(401);
    const res2 = resMock();
    protect({ headers: { authorization: 'Token abc' } }, res2, () => {});
    expect(res2.status).toHaveBeenCalledWith(401);
  });

  it('manual expired branch: decoded.exp in past triggers 401', () => {
    const token = 'dummy';
    jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 'u1', exp: Math.floor(Date.now()/1000) - 10 });
    const res = resMock();
    protect({ headers: { authorization: `Bearer ${token}` } }, res, () => {});
    expect(res.status).toHaveBeenCalledWith(401);
    jwt.verify.mockRestore();
  });

  it('missing sub/id in decoded token triggers 401', () => {
    const token = 'dummy';
    jest.spyOn(jwt, 'verify').mockReturnValue({ email: 'a@b.com' });
    const res = resMock();
    protect({ headers: { authorization: `Bearer ${token}` } }, res, () => {});
    expect(res.status).toHaveBeenCalledWith(401);
    jwt.verify.mockRestore();
  });

  it('TokenExpiredError branch in catch returns 401', () => {
    const token = 'dummy';
    jest.spyOn(jwt, 'verify').mockImplementation(() => { const e = new Error('expired'); e.name = 'TokenExpiredError'; throw e; });
    const res = resMock();
    protect({ headers: { authorization: `Bearer ${token}` } }, res, () => {});
    expect(res.status).toHaveBeenCalledWith(401);
    jwt.verify.mockRestore();
  });

  it('success path populates req.user and calls next', () => {
    const token = 'dummy';
    jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 'u1', email: 'a@b.com', activeRole: 'pro' });
    const res = resMock();
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    protect(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(expect.objectContaining({ id: 'u1', role: 'pro' }));
    jwt.verify.mockRestore();
  });
});

