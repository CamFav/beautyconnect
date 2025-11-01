const { updateAvailability, getAvailability } = require('../../controllers/pro/availability.controller');

jest.mock('../../models/ProDetails', () => ({
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
}));

const ProDetails = require('../../models/ProDetails');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - pro.availability', () => {
  test('updateAvailability validates body type', async () => {
    const res = resMock();
    await updateAvailability({ user: { id: 'p1' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateAvailability validates items', async () => {
    const res = resMock();
    await updateAvailability({ user: { id: 'p1' }, body: [{ day: 1 }] }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateAvailability success', async () => {
    ProDetails.findOneAndUpdate.mockResolvedValue({ availability: [{ day: 'monday', slots: [] }] });
    const res = resMock();
    await updateAvailability({ user: { id: 'p1' }, body: [{ day: 'monday', slots: [] }] }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  test('getAvailability returns array', async () => {
    ProDetails.findOne.mockResolvedValue({ availability: [{ day: 'monday', slots: [] }] });
    const res = resMock();
    await getAvailability({ user: { id: 'p1' } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });
});

