// Unit-style tests that invoke route handlers directly to boost branches
jest.mock('../../models/Post', () => ({
  find: jest.fn(() => ({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue([]),
  })),
  findById: jest.fn(),
  create: jest.fn(async (data) => ({ _id: 'p1', ...data })),
}));

const Post = require('../../models/Post');

// Mock cloudinary to avoid network
jest.mock('../../config/cloudinary', () => ({
  uploader: {
    upload_stream: jest.fn((opts, cb) => {
      // Immediately resolve with a fake URL
      process.nextTick(() => cb(null, { secure_url: 'https://cdn.example.com/unit.jpg' }));
      return { end: () => {} };
    })
  },
}));

const router = require('../../routes/posts.routes');

const getHandler = (path, method) => {
  const layer = router.stack.find(
    (l) => l.route && l.route.path === path && l.route.methods[method]
  );
  // pick last layer handler (after validators)
  return layer && layer.route.stack[layer.route.stack.length - 1].handle;
};

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Routes - posts (unit direct handlers)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns posts and handles provider filter', async () => {
    const handler = getHandler('/', 'get');
    expect(handler).toBeInstanceOf(Function);

    const res = resMock();
    await handler({ query: {} }, res);
    expect(res.json).toHaveBeenCalled();

    const res2 = resMock();
    await handler({ query: { provider: '507f1f77bcf86cd799439011' } }, res2);
    expect(res2.json).toHaveBeenCalled();
  });

  it('GET / catches and returns 500 on error', async () => {
    const handler = getHandler('/', 'get');
    // Make Post.find throw
    Post.find.mockImplementationOnce(() => { throw new Error('boom'); });
    const res = resMock();
    await handler({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('DELETE /:id deletes when owner matches, else 403/404', async () => {
    const handler = getHandler('/:id', 'delete');
    expect(handler).toBeInstanceOf(Function);

    // 404
    Post.findById.mockResolvedValueOnce(null);
    const res404 = resMock();
    await handler({ params: { id: '507f1f77bcf86cd799439011' }, user: { id: 'u1' } }, res404);
    expect(res404.status).toHaveBeenCalledWith(404);

    // 403
    Post.findById.mockResolvedValueOnce({ provider: 'u2' });
    const res403 = resMock();
    await handler({ params: { id: '507f1f77bcf86cd799439011' }, user: { id: 'u1' } }, res403);
    expect(res403.status).toHaveBeenCalledWith(403);

    // 200
    const del = jest.fn().mockResolvedValue({});
    Post.findById.mockResolvedValueOnce({ provider: { toString: () => 'u1' }, deleteOne: del });
    const res200 = resMock();
    await handler({ params: { id: '507f1f77bcf86cd799439011' }, user: { id: 'u1' } }, res200);
    expect(res200.json).toHaveBeenCalled();
    expect(del).toHaveBeenCalled();
  });

  it('POST / creates a post when file present', async () => {
    const handler = getHandler('/', 'post');
    const res = resMock();
    await handler({ user: { id: 'u1' }, body: { description: 'Hi', category: 'Autre' }, file: { buffer: Buffer.from('x') } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('PATCH /:id updates description/category and media when owner', async () => {
    const handler = getHandler('/:id', 'patch');
    const save = jest.fn().mockResolvedValue({});
    const post = { provider: { toString: () => 'u1' }, save };
    Post.findById.mockResolvedValue(post);
    const res = resMock();
    await handler({ params: { id: 'p1' }, user: { id: 'u1' }, body: { description: 'New', category: 'Autre' }, file: { buffer: Buffer.from('y') } }, res);
    expect(res.json).toHaveBeenCalled();
    expect(save).toHaveBeenCalled();
  });

  it('PATCH /:id with upload result missing secure_url keeps media unchanged', async () => {
    const handler = getHandler('/:id', 'patch');
    const save = jest.fn().mockResolvedValue({});
    const post = { mediaUrl: 'old', provider: { toString: () => 'u1' }, save };
    Post.findById.mockResolvedValue(post);
    const cloud = require('../../config/cloudinary');
    cloud.uploader.upload_stream.mockImplementationOnce((opts, cb) => {
      process.nextTick(() => cb(null, {}));
      return { end: () => {} };
    });
    const res = resMock();
    await handler({ params: { id: 'p1' }, user: { id: 'u1' }, body: { description: 'New' }, file: { buffer: Buffer.from('z') } }, res);
    expect(post.mediaUrl).toBe('old');
    expect(save).toHaveBeenCalled();
  });

  it('POST / returns 500 when cloudinary fails', async () => {
    const handler = getHandler('/', 'post');
    const cloud = require('../../config/cloudinary');
    cloud.uploader.upload_stream.mockImplementationOnce((opts, cb) => {
      process.nextTick(() => cb(new Error('cloud')));
      return { end: () => {} };
    });
    const res = resMock();
    await handler({ user: { id: 'u1' }, body: { description: 'Hi' }, file: { buffer: Buffer.from('x') } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('PATCH /:id returns 500 on DB error', async () => {
    const handler = getHandler('/:id', 'patch');
    Post.findById.mockImplementationOnce(() => { throw new Error('db'); });
    const res = resMock();
    await handler({ params: { id: 'p1' }, user: { id: 'u1' }, body: { description: 'New' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('DELETE /:id returns 500 on DB error', async () => {
    const handler = getHandler('/:id', 'delete');
    Post.findById.mockImplementationOnce(() => { throw new Error('db'); });
    const res = resMock();
    await handler({ params: { id: 'p1' }, user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('POST /:id/like returns 500 on DB error', async () => {
    const handler = getHandler('/:id/like', 'post');
    Post.findById.mockImplementationOnce(() => { throw new Error('db'); });
    const res = resMock();
    await handler({ params: { id: 'p1' }, user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('POST /:id/favorite returns 500 on DB error', async () => {
    const handler = getHandler('/:id/favorite', 'post');
    Post.findById.mockImplementationOnce(() => { throw new Error('db'); });
    const res = resMock();
    await handler({ params: { id: 'p1' }, user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('POST /:id/like returns 404 when post not found', async () => {
    const handler = getHandler('/:id/like', 'post');
    Post.findById.mockResolvedValueOnce(null);
    const res = resMock();
    await handler({ params: { id: 'p1' }, user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('POST /:id/favorite returns 404 when post not found', async () => {
    const handler = getHandler('/:id/favorite', 'post');
    Post.findById.mockResolvedValueOnce(null);
    const res = resMock();
    await handler({ params: { id: 'p1' }, user: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('PATCH /:id returns 404 when post not found', async () => {
    const handler = getHandler('/:id', 'patch');
    Post.findById.mockResolvedValueOnce(null);
    const res = resMock();
    await handler({ params: { id: 'p1' }, user: { id: 'u1' }, body: { description: 'x' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('PATCH /:id returns 403 when not owner', async () => {
    const handler = getHandler('/:id', 'patch');
    Post.findById.mockResolvedValueOnce({ provider: { toString: () => 'someone-else' } });
    const res = resMock();
    await handler({ params: { id: 'p1' }, user: { id: 'u1' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('POST /:id/like toggles liked flag', async () => {
    const handler = getHandler('/:id/like', 'post');
    const save = jest.fn().mockResolvedValue({});
    // Not liked yet
    Post.findById.mockResolvedValueOnce({ likes: [], save });
    const res1 = resMock();
    await handler({ params: { id: '507f1f77bcf86cd799439011' }, user: { id: 'u1' } }, res1);
    expect(res1.json).toHaveBeenCalledWith(expect.objectContaining({ liked: true }));
    // Liked already
    Post.findById.mockResolvedValueOnce({ likes: ['u1'], save });
    const res2 = resMock();
    await handler({ params: { id: '507f1f77bcf86cd799439011' }, user: { id: 'u1' } }, res2);
    expect(res2.json).toHaveBeenCalledWith(expect.objectContaining({ liked: false }));
  });

  it('POST /:id/favorite toggles favorited flag', async () => {
    const handler = getHandler('/:id/favorite', 'post');
    const save = jest.fn().mockResolvedValue({});
    Post.findById.mockResolvedValueOnce({ favorites: [], save });
    const res1 = resMock();
    await handler({ params: { id: '507f1f77bcf86cd799439011' }, user: { id: 'u1' } }, res1);
    expect(res1.json).toHaveBeenCalledWith(expect.objectContaining({ favorited: true }));
    Post.findById.mockResolvedValueOnce({ favorites: ['u1'], save });
    const res2 = resMock();
    await handler({ params: { id: '507f1f77bcf86cd799439011' }, user: { id: 'u1' } }, res2);
    expect(res2.json).toHaveBeenCalledWith(expect.objectContaining({ favorited: false }));
  });
});
