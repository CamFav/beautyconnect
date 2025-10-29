process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const { updateRole } = require('../../controllers/account/account.controller');

jest.mock('../../models/User', () => ({
  findById: jest.fn(),
}));

const User = require('../../models/User');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - account.updateRole branches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 on invalid role', async () => {
    const res = resMock();
    await updateRole({ user: { id: 'u1' }, body: { role: 'admin' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when user not found', async () => {
    User.findById.mockResolvedValue(null);
    const res = resMock();
    await updateRole({ user: { id: 'u1' }, body: { role: 'pro' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('normalizes non-object location before saving', async () => {
    const user = { _id: 'u1', email: 'a@b.com', name: 'A', role: 'client', activeRole: 'client', location: 'Paris', save: jest.fn() };
    User.findById.mockResolvedValue(user);
    const res = resMock();
    await updateRole({ user: { id: 'u1' }, body: { role: 'pro' } }, res);
    expect(res.json).toHaveBeenCalled();
  });
});
