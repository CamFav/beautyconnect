process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

jest.mock('../../models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../../config/cloudinary', () => ({
  uploader: {
    upload_stream: jest.fn((opts, cb) => { process.nextTick(() => cb(null, { secure_url: 'https://cdn/avatar.jpg' })); return { end: () => {} }; })
  }
}));

const User = require('../../models/User');
const router = require('../../routes/users.routes');

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

describe('Routes - users unit branches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('follow: self-follow returns 400', async () => {
    const handler = getHandler('/:id/follow', 'post');
    const res = resMock();
    await handler({ params: { id: 'u1' }, user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('follow: target not found returns 404', async () => {
    const handler = getHandler('/:id/follow', 'post');
    User.findById.mockResolvedValueOnce(null); // targetUser
    User.findById.mockResolvedValueOnce({ following: [] }); // currentUser
    const res = resMock();
    await handler({ params: { id: 'u2' }, user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('follow: error branch returns 500', async () => {
    const handler = getHandler('/:id/follow', 'post');
    User.findById.mockImplementation(() => { throw new Error('db'); });
    const res = resMock();
    await handler({ params: { id: 'u2' }, user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('avatar: invalid role and missing file return 400', async () => {
    const handler = getHandler('/:role/avatar', 'patch');
    let res = resMock();
    await handler({ params: { role: 'x' }, user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res = resMock();
    await handler({ params: { role: 'client' }, user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('avatar: success path updates user avatar', async () => {
    const handler = getHandler('/:role/avatar', 'patch');
    User.findByIdAndUpdate.mockReturnValue({ select: () => Promise.resolve({ _id: 'u1', avatarClient: 'https://cdn/avatar.jpg' }) });
    const res = resMock();
    await handler({ params: { role: 'client' }, user: { id: 'u1' }, file: { buffer: Buffer.from('x') } }, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('me/following: returns 404 when user not found', async () => {
    // locate handler
    const layer = router.stack.find((l) => l.route && l.route.path === '/me/following');
    const handler = layer.route.stack[layer.route.stack.length - 1].handle;
    User.findById.mockReturnValue({ select: () => Promise.resolve(null) });
    const res = resMock();
    await handler({ user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('public profile: 404 when user not found', async () => {
    const layer = router.stack.find((l) => l.route && l.route.path === '/:id/public');
    const handler = layer.route.stack[layer.route.stack.length - 1].handle;
    const res = resMock();
    // simulate validate already passed; mock model chain
    User.findById.mockReturnValue({ select: () => ({ lean: () => Promise.resolve(null) }) });
    await handler({ params: { id: '507f1f77bcf86cd799439011' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
