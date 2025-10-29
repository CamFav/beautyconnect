const { exportUserData } = require('../../controllers/account/export.controller');

jest.mock('../../models/User', () => ({ findById: jest.fn() }));
jest.mock('../../models/Post', () => ({ find: jest.fn(() => ({ select: () => ({ lean: () => Promise.resolve([]) }) })) }));
jest.mock('../../models/Reservation', () => ({ find: jest.fn(() => ({ select: () => ({ lean: () => Promise.resolve([]) }) })) }));

const User = require('../../models/User');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  return res;
};

describe('Controller - account.export', () => {
  it('404 when user missing', async () => {
    User.findById.mockReturnValue({ select: () => ({ lean: () => Promise.resolve(null) }) });
    const res = resMock();
    await exportUserData({ user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('200 returns export with headers', async () => {
    User.findById.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ _id: 'u1', name: 'A' }) }) });
    const res = resMock();
    await exportUserData({ user: { id: 'u1' } }, res);
    expect(res.setHeader).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: expect.any(Object) }));
  });
});

