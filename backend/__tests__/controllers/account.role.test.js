const { updateRole } = require('../../controllers/account/account.controller');

jest.mock('../../models/User', () => ({
  findById: jest.fn(),
}));

jest.mock('../../utils/jwt', () => ({
  generateToken: jest.fn(() => 'tok')
}));

const User = require('../../models/User');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - account.updateRole', () => {
  it('400 on invalid role', async () => {
    const req = { user: { id: 'u1' }, body: { role: 'wrong' } };
    const res = mockRes();
    await updateRole(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('404 when user not found', async () => {
    const req = { user: { id: 'u1' }, body: { role: 'pro' } };
    const res = mockRes();
    User.findById.mockResolvedValue(null);
    await updateRole(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('200 and returns token on success', async () => {
    const req = { user: { id: 'u1' }, body: { role: 'pro' } };
    const res = mockRes();
    const fake = { _id: 'u1', email: 'a@b.com', name: 'A', role: 'client', activeRole: 'client', save: jest.fn() };
    User.findById.mockResolvedValue(fake);
    await updateRole(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'tok' }));
  });
});

