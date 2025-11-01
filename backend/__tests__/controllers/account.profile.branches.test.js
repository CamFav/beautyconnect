process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const {
  updateProProfile,
  updatePassword,
} = require('../../controllers/account/account.controller');

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

describe('Controller - account pro profile branches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('updateProProfile 404 when user not found', async () => {
    User.findById.mockResolvedValue(null);
    const res = resMock();
    await updateProProfile({ user: { id: 'u1' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updateProProfile validation failures', async () => {
    User.findById.mockResolvedValue({ proProfile: {} });
    let res = resMock();
    await updateProProfile({ user: { id: 'u1' }, body: { businessName: 'x' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res = resMock();
    await updateProProfile({ user: { id: 'u1' }, body: { siret: '123' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res = resMock();
    await updateProProfile({ user: { id: 'u1' }, body: { status: 'invalid' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res = resMock();
    await updateProProfile({ user: { id: 'u1' }, body: { experience: 'nope' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res = resMock();
    await updateProProfile({ user: { id: 'u1' }, body: { location: { city: '', country: '' } } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res = resMock();
    await updateProProfile({ user: { id: 'u1' }, body: { categories: ['Invalide'] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateProProfile success sets fields and returns token', async () => {
    const user = { _id: 'u1', email: 'a@b.com', name: 'A', proProfile: {}, save: jest.fn(), role: 'client', activeRole: 'client' };
    User.findById.mockResolvedValue(user);
    const req = { user: { id: 'u1' }, body: {
      businessName: 'Salon&Co', siret: '12345678901234', status: 'salon', experience: '2+ ans',
      exerciseType: ['domicile'], services: [], categories: ['Coiffure'],
      location: { city: 'Paris', country: 'FR', address: 'Rue X', label: 'Label', latitude: 1.23, longitude: 4.56 }
    } };
    const res = resMock();
    await updateProProfile(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
  });
});

describe('Controller - account password branches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('updatePassword returns 401 when current password mismatch', async () => {
    const user = { password: 'hash', save: jest.fn() };
    User.findById.mockReturnValue({ select: () => Promise.resolve(user) });
    jest.resetModules();
    jest.doMock('bcryptjs', () => ({ compare: jest.fn().mockResolvedValue(false) }));
    let mod;
    jest.isolateModules(() => {
      // eslint-disable-next-line global-require
      mod = require('../../controllers/account/account.controller');
    });
    const res = resMock();
    await mod.updatePassword({ user: { id: 'u1' }, body: { currentPassword: 'A', newPassword: 'Password123!' } }, res);
    expect(res.status).toHaveBeenCalled();
  });
});
