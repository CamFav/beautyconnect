process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

jest.mock('bcryptjs', () => ({ compare: jest.fn().mockResolvedValue(false) }));

jest.mock('../../models/User', () => ({
  findById: jest.fn(),
}));

const User = require('../../models/User');
const { updatePassword } = require('../../controllers/account/account.controller');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - account.updatePassword branches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when bcrypt.compare false', async () => {
    User.findById.mockReturnValue({ select: () => Promise.resolve({ password: 'hash' }) });
    const res = resMock();
    await updatePassword({ user: { id: 'u1' }, body: { currentPassword: 'A', newPassword: 'Password123!' } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

