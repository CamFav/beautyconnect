const {
  createReservation,
  getByClient,
  getByPro,
  updateStatus,
} = require('../../controllers/reservations/reservation.controller');

jest.mock('../../models/Reservation', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));
jest.mock('../../models/ProDetails', () => ({
  findOne: jest.fn(),
}));

const Reservation = require('../../models/Reservation');
const ProDetails = require('../../models/ProDetails');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - reservations', () => {
  beforeEach(() => jest.clearAllMocks());

  test('createReservation validates required fields', async () => {
    const res = resMock();
    await createReservation({ user: { id: 'c1' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('createReservation invalid date/time', async () => {
    const res = resMock();
    await createReservation({ user: { id: 'c1' }, body: { proId: 'p1', serviceId: 's1', date: 'bad', time: '10:00' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    res.status.mockClear(); res.json.mockClear();
    await createReservation({ user: { id: 'c1' }, body: { proId: 'p1', serviceId: 's1', date: '2025-01-01', time: 'bad' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  const detailsBase = () => ({
    services: { id: (id) => (id === 's1' ? { name: 'Hair', price: 20, duration: 30 } : null) },
    availability: [
      { day: 'wednesday', enabled: true, slots: [{ start: '10:00', end: '12:00' }] }
    ]
  });

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const nextWeekday = (weekday) => {
    const map = { sunday:0, monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6 };
    const target = map[weekday];
    const now = new Date();
    const d = new Date(now);
    const diff = (target - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return formatDate(d);
  };

  test('404 when pro not found or service not found', async () => {
    const res = resMock();
    ProDetails.findOne.mockResolvedValue(null);
    await createReservation({ user: { id: 'c1' }, body: { proId: 'p1', serviceId: 's1', date: nextWeekday('thursday'), time: '10:30' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    res.status.mockClear();
    ProDetails.findOne.mockResolvedValue({ services: { id: () => null } });
    await createReservation({ user: { id: 'c1' }, body: { proId: 'p1', serviceId: 'bad', date: nextWeekday('thursday'), time: '10:30' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('400 when time not in range or conflict', async () => {
    const res = resMock();
    // Not in range (choose date with different weekday than availability)
    ProDetails.findOne.mockResolvedValue(detailsBase());
    await createReservation({ user: { id: 'c1' }, body: { proId: 'p1', serviceId: 's1', date: nextWeekday('thursday'), time: '10:30' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // Conflict
    res.status.mockClear(); res.json.mockClear();
    ProDetails.findOne.mockResolvedValue({ ...detailsBase(), availability: [{ day: 'thursday', enabled: true, slots: [{ start: '10:00', end: '12:00' }] }] });
    Reservation.findOne.mockResolvedValue({ id: 'r1' });
    await createReservation({ user: { id: 'c1' }, body: { proId: 'p1', serviceId: 's1', date: nextWeekday('thursday'), time: '10:30' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('success reservation', async () => {
    const res = resMock();
    ProDetails.findOne.mockResolvedValue({ ...detailsBase(), availability: [{ day: 'thursday', enabled: true, slots: [{ start: '10:00', end: '12:00' }] }] });
    Reservation.findOne.mockResolvedValue(null);
    Reservation.create.mockResolvedValue({ id: 'r1', clientId: 'c1', proId: 'p1', time: '10:30' });
    await createReservation({ user: { id: 'c1' }, body: { proId: 'p1', serviceId: 's1', date: nextWeekday('thursday'), time: '10:30' } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
  });

  test('getByClient and getByPro return lists and handle error', async () => {
    const res = resMock();
    Reservation.find.mockReturnValue({ populate: () => ({ sort: () => Promise.resolve([1,2]) }) });
    await getByClient({ params: { clientId: 'c1' } }, res);
    expect(res.json).toHaveBeenCalledWith([1,2]);

    const res2 = resMock();
    Reservation.find.mockImplementation(() => { throw new Error('DB'); });
    await getByClient({ params: { clientId: 'c1' } }, res2);
    expect(res2.status).toHaveBeenCalledWith(500);

    const res3 = resMock();
    Reservation.find.mockReturnValue({ populate: () => ({ sort: () => Promise.resolve([3]) }) });
    await getByPro({ params: { proId: 'p1' } }, res3);
    expect(res3.json).toHaveBeenCalledWith([3]);

    const res4 = resMock();
    Reservation.find.mockImplementation(() => { throw new Error('DB'); });
    await getByPro({ params: { proId: 'p1' } }, res4);
    expect(res4.status).toHaveBeenCalledWith(500);
  });

  test('updateStatus 404 and success and error', async () => {
    const res = resMock();
    Reservation.findByIdAndUpdate.mockResolvedValue(null);
    await updateStatus({ params: { id: 'r1' }, body: { status: 'confirmed' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);

    const res2 = resMock();
    Reservation.findByIdAndUpdate.mockResolvedValue({ id: 'r1', status: 'confirmed' });
    await updateStatus({ params: { id: 'r1' }, body: { status: 'confirmed' } }, res2);
    expect(res2.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'confirmed' }));

    const res3 = resMock();
    Reservation.findByIdAndUpdate.mockRejectedValue(new Error('DB'));
    await updateStatus({ params: { id: 'r1' }, body: { status: 'confirmed' } }, res3);
    expect(res3.status).toHaveBeenCalledWith(500);
  });
});
