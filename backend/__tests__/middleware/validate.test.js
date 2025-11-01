const validate = require('../../middleware/validate');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock('express-validator', () => ({
  validationResult: () => ({
    isEmpty: () => false,
    array: () => ([{ param: 'email', msg: 'Invalid email' }])
  })
}));

describe('Middleware - validate', () => {
  it('returns 400 with formatted errors', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();
    validate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
  });

  it('calls next when no errors', () => {
    jest.resetModules();
    jest.doMock('express-validator', () => ({
      validationResult: () => ({ isEmpty: () => true })
    }));
    const freshValidate = require('../../middleware/validate');
    const req = {};
    const res = mockRes();
    const next = jest.fn();
    freshValidate(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
