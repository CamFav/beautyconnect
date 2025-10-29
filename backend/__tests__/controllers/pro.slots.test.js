const { getAvailableSlots } = require('../../controllers/pro/slots.controller');

jest.mock('../../models/Reservation', () => ({ find: jest.fn() }));
jest.mock('../../models/ProDetails', () => ({ findOne: jest.fn() }));

const Reservation = require('../../models/Reservation');
const ProDetails = require('../../models/ProDetails');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - pro.slots', () => {
  beforeEach(() => jest.clearAllMocks());

  test('validates inputs', async () => {
    const res = resMock();
    await getAvailableSlots({ params: { proId: 'p1' }, query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    res.status.mockClear();
    await getAvailableSlots({ params: { proId: 'p1' }, query: { date: '2025-01-01' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    res.status.mockClear();
    await getAvailableSlots({ params: { proId: 'p1' }, query: { date: 'bad', serviceId: 's1' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('404 when pro or service not found', async () => {
    const res = resMock();
    ProDetails.findOne.mockResolvedValue(null);
    await getAvailableSlots({ params: { proId: 'p1' }, query: { date: '2025-01-01', serviceId: 's1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    res.status.mockClear();
    ProDetails.findOne.mockResolvedValue({ services: { id: () => null } });
    await getAvailableSlots({ params: { proId: 'p1' }, query: { date: '2025-01-01', serviceId: 's1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('400 for invalid service duration', async () => {
    const res = resMock();
    ProDetails.findOne.mockResolvedValue({ services: { id: () => ({ duration: 0 }) } });
    await getAvailableSlots({ params: { proId: 'p1' }, query: { date: '2025-01-01', serviceId: 's1' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns empty when no availability', async () => {
    const res = resMock();
    ProDetails.findOne.mockResolvedValue({ services: { id: () => ({ duration: 30 }) }, availability: [] });
    await getAvailableSlots({ params: { proId: 'p1' }, query: { date: '2025-01-05', serviceId: 's1' } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ availableSlots: [] }));
  });

  test('generates slots and removes taken ones', async () => {
    const res = resMock();
    ProDetails.findOne.mockResolvedValue({
      services: { id: () => ({ duration: 30 }) },
      availability: [
        { day: 'sunday', slots: [{ start: '10:00', end: '12:00' }] }
      ]
    });
    Reservation.find.mockResolvedValue([{ time: '10:30' }]);

    await getAvailableSlots({ params: { proId: 'p1' }, query: { date: '2025-01-05', serviceId: 's1' } }, res);
    const payload = res.json.mock.calls[0][0];
    expect(payload.availableSlots).toContain('10:00');
    expect(payload.availableSlots).not.toContain('10:30');
  });
});

