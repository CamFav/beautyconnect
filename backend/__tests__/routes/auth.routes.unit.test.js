process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
}));

const User = require('../../models/User');
const router = require('../../routes/auth.routes');

const getHandler = (path, method) => {
  const layer = router.stack.find((l) => l.route && l.route.path === path && l.route.methods[method]);
  return layer && layer.route.stack[layer.route.stack.length - 1].handle;
};

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Routes - auth (unit error branches)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('register handler catches thrown errors and returns 500', async () => {
    const handler = getHandler('/register', 'post');
    User.findOne.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await handler({ body: { name: 'A', email: 'a@b.com', password: 'Password123!' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('login handler catches thrown errors and returns 500', async () => {
    const handler = getHandler('/login', 'post');
    User.findOne.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await handler({ body: { email: 'a@b.com', password: 'Password123!' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('/me handler catches thrown errors and returns 500', async () => {
    const handler = getHandler('/me', 'get');
    User.findById.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await handler({ user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('/me returns 404 when user not found', async () => {
    const handler = getHandler('/me', 'get');
    User.findById.mockReturnValue({ select: () => ({ lean: () => Promise.resolve(null) }) });
    const res = resMock();
    await handler({ user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('register returns 400 when email already exists', async () => {
    const handler = getHandler('/register', 'post');
    User.findOne.mockResolvedValue({ _id: 'u1' });
    const res = resMock();
    await handler({ body: { name: 'A', email: 'a@b.com', password: 'Password123!' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('login returns 401 when password mismatch', async () => {
    const handler = getHandler('/login', 'post');
    const user = { comparePassword: jest.fn().mockResolvedValue(false) };
    User.findOne.mockReturnValue({ select: () => Promise.resolve(user) });
    const res = resMock();
    await handler({ body: { email: 'a@b.com', password: 'Wrong123!' } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
