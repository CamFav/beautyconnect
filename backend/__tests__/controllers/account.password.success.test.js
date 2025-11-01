process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
jest.mock('bcryptjs', () => ({ compare: jest.fn(async () => true) }));

const { updatePassword } = require('../../controllers/account/account.controller');

jest.mock('../../models/User', () => ({
  findById: jest.fn(() => ({
    select: () => Promise.resolve({ password: 'hashed', save: jest.fn(async () => {}) })
  }))
}));

const User = require('../../models/User');
const bcrypt = require('bcryptjs');

const resMock = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };

describe('Controller - account.updatePassword success', () => {
  it('returns 200 when password updated', async () => {
    const req = { user: { id: 'u1' }, body: { currentPassword: 'Password123!', newPassword: 'Password123!' } };
    const res = resMock();
    await updatePassword(req, res);
    expect(bcrypt.compare).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});
