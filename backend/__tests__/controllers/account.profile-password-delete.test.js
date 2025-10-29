process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const {
  updateProfile,
  updatePassword,
  deleteAccount,
  updateProProfile,
  updateProHeaderImage,
} = require('../../controllers/account/account.controller');

jest.mock('../../models/User', () => ({
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('../../config/cloudinary', () => {
  // Call the callback on nextTick to avoid relying on stream.finish
  return {
    uploader: {
      upload_stream: jest.fn((opts, cb) => {
        process.nextTick(() => cb(null, { secure_url: 'https://img/test.jpg' }));
        // return a minimal stream-like object with end() no-op
        return { end: () => {} };
      })
    }
  };
});

const User = require('../../models/User');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - account.profile/password/delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('updateProfile returns 404 when user not found', async () => {
    User.findById.mockResolvedValue(null);
    const req = { user: { id: 'u1' }, body: {} };
    const res = resMock();
    await updateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updateProfile validates name/email/phone', async () => {
    User.findById.mockResolvedValue({ proProfile: {}, location: {} });
    const res = resMock();

    await updateProfile({ user: { id: 'u1' }, body: { name: 'x' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res.status.mockClear(); res.json.mockClear();
    await updateProfile({ user: { id: 'u1' }, body: { email: 'bad' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res.status.mockClear(); res.json.mockClear();
    await updateProfile({ user: { id: 'u1' }, body: { phone: 'abc' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateProfile success updates fields', async () => {
    const user = { proProfile: { location: {} }, location: {}, save: jest.fn() };
    User.findById.mockResolvedValue(user);
    const req = { user: { id: 'u1' }, body: { name: 'John Doe', email: 'john@example.com', phone: '+33 612345678', location: { city: 'Paris', country: 'FR' } } };
    const res = resMock();
    await updateProfile(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('updatePassword missing fields', async () => {
    const res = resMock();
    await updatePassword({ user: { id: 'u1' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updatePassword invalid new password', async () => {
    const res = resMock();
    await updatePassword({ user: { id: 'u1' }, body: { currentPassword: 'A', newPassword: 'short' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updatePassword not found', async () => {
    User.findById.mockReturnValue({ select: () => Promise.resolve(null) });
    const res = resMock();
    await updatePassword({ user: { id: 'u1' }, body: { currentPassword: 'Password123!', newPassword: 'Password123!' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deleteAccount 404 and success', async () => {
    const res = resMock();
    User.findById.mockResolvedValue(null);
    await deleteAccount({ user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);

    res.status.mockClear(); res.json.mockClear();
    User.findById.mockResolvedValue({ _id: 'u1' });
    User.findByIdAndDelete.mockResolvedValue({});
    await deleteAccount({ user: { id: 'u1' } }, res);
    expect(res.json).toHaveBeenCalled();
  });
});

describe('Controller - account.pro profile/header', () => {
  test('updateProProfile creates/updates proProfile', async () => {
    const user = { proProfile: null, save: jest.fn() };
    User.findById.mockResolvedValue(user);
    const req = { user: { id: 'u1' }, body: { businessName: 'Salon', siret: '12345678901234', status: 'salon', experience: '2+ ans', location: { city: 'Paris', country: 'FR' }, categories: ['cut'], exerciseType: ['domicile'] } };
    const res = resMock();
    await updateProProfile(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('updateProHeaderImage without file returns 400', async () => {
    const res = resMock();
    await updateProHeaderImage({ user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateProHeaderImage uploads and saves url (no crash)', async () => {
    const user = { proProfile: {}, save: jest.fn() };
    User.findById.mockResolvedValue(user);
    const req = { user: { id: 'u1' }, file: { buffer: Buffer.from('x') } };
    const res = resMock();
    await expect(updateProHeaderImage(req, res)).resolves.not.toThrow();
  });
});
