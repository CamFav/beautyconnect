process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const {
  updateProfile,
  updateProHeaderImage,
  deleteAccount,
} = require('../../controllers/account/account.controller');

jest.mock('../../models/User', () => ({
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

const User = require('../../models/User');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - account error branches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updateProfile catch returns 500', async () => {
    User.findById.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await updateProfile({ user: { id: 'u1' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('updateProHeaderImage catch returns 500', async () => {
    User.findById.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await updateProHeaderImage({ user: { id: 'u1' }, file: { buffer: Buffer.from('x') } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('updateProHeaderImage 404 when user not found', async () => {
    User.findById.mockResolvedValue(null);
    const res = resMock();
    await updateProHeaderImage({ user: { id: 'u1' }, file: { buffer: Buffer.from('x') } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deleteAccount catch returns 500', async () => {
    User.findById.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await deleteAccount({ user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

const { updateRole } = require('../../controllers/account/account.controller');

describe('Controller - account.updateRole error branch', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 500 on thrown error', async () => {
    User.findById.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await updateRole({ user: { id: 'u1' }, body: { role: 'pro' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
