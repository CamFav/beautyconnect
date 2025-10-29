process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

jest.mock('../../models/User', () => ({
  findById: jest.fn(),
}));

const User = require('../../models/User');
const router = require('../../routes/account.routes');

const getHandler = (path, method) => {
  const layer = router.stack.find((l) => l.route && l.route.path === path && l.route.methods[method]);
  return layer && layer.route.stack[layer.route.stack.length - 1].handle;
};

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Routes - account /upgrade unit branches', () => {
  beforeEach(() => jest.clearAllMocks());

  const baseBody = {
    businessName: 'Salon OK',
    siret: '12345678901234',
    status: 'freelance',
    experience: '<1 an',
    location: { city: 'Paris', country: 'FR' },
    exerciseType: [],
    services: [],
    categories: [],
  };

  it('returns 404 when user not found', async () => {
    const handler = getHandler('/upgrade', 'put');
    User.findById.mockResolvedValue(null);
    const res = resMock();
    await handler({ user: { id: 'u1' }, body: baseBody }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('validation errors for businessName, siret, location, status, experience', async () => {
    const handler = getHandler('/upgrade', 'put');
    User.findById.mockResolvedValue({ save: jest.fn() });
    let res = resMock();
    await handler({ user: { id: 'u1' }, body: { ...baseBody, businessName: 'x' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res = resMock();
    await handler({ user: { id: 'u1' }, body: { ...baseBody, siret: '123' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res = resMock();
    await handler({ user: { id: 'u1' }, body: { ...baseBody, location: { city: '', country: '' } } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res = resMock();
    await handler({ user: { id: 'u1' }, body: { ...baseBody, status: 'invalid' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res = resMock();
    await handler({ user: { id: 'u1' }, body: { ...baseBody, experience: 'nope' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('success path 200', async () => {
    const handler = getHandler('/upgrade', 'put');
    const user = { save: jest.fn(), proProfile: null };
    User.findById.mockResolvedValue(user);
    const res = resMock();
    await handler({ user: { id: 'u1' }, body: baseBody }, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('catches thrown error and returns 500', async () => {
    const handler = getHandler('/upgrade', 'put');
    User.findById.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await handler({ user: { id: 'u1' }, body: baseBody }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

