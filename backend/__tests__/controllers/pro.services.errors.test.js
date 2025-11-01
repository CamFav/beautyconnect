const {
  getMyServices,
  createService,
  updateService,
  deleteService,
  getPublicServices,
} = require('../../controllers/pro/services.controller');

jest.mock('../../models/ProDetails', () => ({
  findOne: jest.fn(),
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

describe('Controller - pro.services error branches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getMyServices catch returns 500', async () => {
    ProDetails.findOne.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await getMyServices({ user: { id: 'p1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('createService catch returns 500', async () => {
    ProDetails.findOne.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    // Use a valid name (>=2 chars) to bypass validation and trigger DB call
    await createService({ user: { id: 'p1' }, body: { name: 'Ok', price: 10, duration: 30 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('updateService catch returns 500', async () => {
    ProDetails.findOne.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await updateService({ user: { id: 'p1' }, params: { serviceId: 's1' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('deleteService catch returns 500', async () => {
    ProDetails.updateOne.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await deleteService({ user: { id: 'p1' }, params: { serviceId: 's1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('getPublicServices catch returns 500', async () => {
    ProDetails.findOne.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await getPublicServices({ params: { proId: 'p1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
