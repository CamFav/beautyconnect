const {
  getMyServices,
  createService,
  updateService,
  deleteService,
  getPublicServices,
} = require('../../controllers/pro/services.controller');

jest.mock('../../models/ProDetails', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
  create: jest.fn(),
}));

const ProDetails = require('../../models/ProDetails');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller - pro.services', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getMyServices returns [] when none', async () => {
    ProDetails.findOne.mockReturnValue({ lean: () => Promise.resolve(null) });
    const res = resMock();
    await getMyServices({ user: { id: 'p1' } }, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('getMyServices returns array', async () => {
    ProDetails.findOne.mockReturnValue({ lean: () => Promise.resolve({ services: [{ name: 'Cut' }] }) });
    const res = resMock();
    await getMyServices({ user: { id: 'p1' } }, res);
    expect(res.json).toHaveBeenCalledWith([{ name: 'Cut' }]);
  });

  test('createService validates inputs', async () => {
    const res = resMock();
    await createService({ user: { id: 'p1' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('createService creates ProDetails if missing and returns 201', async () => {
    const save = jest.fn();
    ProDetails.findOne.mockResolvedValue(null);
    ProDetails.create.mockResolvedValue({ proId: 'p1', services: [] });
    ProDetails.findOne.mockResolvedValueOnce(null);
    const res = resMock();
    const doc = { services: [], save };
    ProDetails.findOne.mockResolvedValueOnce(null);
    ProDetails.create.mockResolvedValueOnce(doc);
    await createService({ user: { id: 'p1' }, body: { name: 'Coupe', price: 20, duration: 30, description: '<b>ok</b>' } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('updateService 404 when no proDetails', async () => {
    ProDetails.findOne.mockResolvedValue(null);
    const res = resMock();
    await updateService({ user: { id: 'p1' }, params: { serviceId: 's1' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updateService 404 when service not found', async () => {
    ProDetails.findOne.mockResolvedValue({ services: { id: () => null } });
    const res = resMock();
    await updateService({ user: { id: 'p1' }, params: { serviceId: 's1' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updateService invalid price/duration', async () => {
    const service = {};
    const save = jest.fn();
    ProDetails.findOne.mockResolvedValue({ services: { id: () => service }, save });
    const res = resMock();
    await updateService({ user: { id: 'p1' }, params: { serviceId: 's1' }, body: { price: -1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    res.status.mockClear();
    await updateService({ user: { id: 'p1' }, params: { serviceId: 's1' }, body: { duration: 0 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateService success', async () => {
    const service = { name: 'Old', price: 10, duration: 30 };
    const save = jest.fn();
    ProDetails.findOne.mockResolvedValue({ services: { id: () => service }, save });
    const res = resMock();
    await updateService({ user: { id: 'p1' }, params: { serviceId: 's1' }, body: { name: 'New', price: 25, duration: 45, description: 'text' } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'New', price: 25, duration: 45 }));
  });

  test('deleteService 404 when not modified', async () => {
    ProDetails.updateOne.mockResolvedValue({ modifiedCount: 0 });
    const res = resMock();
    await deleteService({ user: { id: 'p1' }, params: { serviceId: 's1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deleteService success', async () => {
    ProDetails.updateOne.mockResolvedValue({ modifiedCount: 1 });
    const res = resMock();
    await deleteService({ user: { id: 'p1' }, params: { serviceId: 's1' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getPublicServices validates proId and returns services', async () => {
    const res = resMock();
    await getPublicServices({ params: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res.status.mockClear(); res.json.mockClear();
    ProDetails.findOne.mockReturnValue({ lean: () => Promise.resolve({ services: [{ n: 1 }] }) });
    await getPublicServices({ params: { proId: 'p1' } }, res);
    expect(res.json).toHaveBeenCalledWith([{ n: 1 }]);
  });
});
