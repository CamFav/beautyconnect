process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const router = require('../../routes/reservations.routes');

const getRouteStack = (path, method) => {
  const layer = router.stack.find((l) => l.route && l.route.path === path && l.route.methods[method]);
  return layer && layer.route.stack;
};

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Routes - reservations guards unit', () => {
  it('client guard returns 403 when ids mismatch', () => {
    const stack = getRouteStack('/client/:clientId', 'get');
    const guard = stack[stack.length - 2].handle; // middleware before controller
    const res = resMock();
    guard({ user: { id: 'u1' }, params: { clientId: 'u2' } }, res, () => {});
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('pro guard returns 403 when ids mismatch', () => {
    const stack = getRouteStack('/pro/:proId', 'get');
    const guard = stack[stack.length - 2].handle;
    const res = resMock();
    guard({ user: { id: 'u1' }, params: { proId: 'u2' } }, res, () => {});
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

