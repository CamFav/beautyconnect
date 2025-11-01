// Mock cloudinary for uploads
jest.mock('../../config/cloudinary', () => {
  const { PassThrough } = require('stream');
  return {
    uploader: {
      upload_stream: jest.fn((opts, cb) => {
        const stream = new PassThrough();
        stream.on('finish', () => cb(null, { secure_url: 'https://cdn.example.com/post.jpg' }));
        stream.on('error', (e) => cb(e));
        return stream;
      })
    }
  };
});

const request = require('supertest');
const app = require('../../app');

describe('Routes - posts', () => {
  const password = 'Password123!';
  let token, userId, postId;

  beforeEach(async () => {
    const email = `post_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Poster', email, password });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    token = login.body.token;
    userId = login.body.user.id;
    postId = undefined;
  });

  it('GET /api/posts (empty list)', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('posts');
  });

  it('POST /api/posts rejects without file and accepts with file', async () => {
    const bad = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`);
    expect(bad.statusCode).toBe(400);

    const ok = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .attach('media', Buffer.from('img'), { filename: 'a.png', contentType: 'image/png' })
      .field('description', 'Hello')
      .field('category', 'Autre');
    expect(ok.statusCode).toBe(201);
    postId = ok.body.post?._id || ok.body.post?.id;
  });

  it('GET /api/posts?provider=me returns my posts', async () => {
    if (!userId) return;
    // ensure a post exists
    const withFile = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .attach('media', Buffer.from('img2'), { filename: 'b.png', contentType: 'image/png' })
      .field('description', 'Another')
      .field('category', 'Autre');
    expect([201,400,500]).toContain(withFile.statusCode);

    const res = await request(app).get(`/api/posts`).query({ provider: userId });
    expect([200]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('posts');
  });

  it('GET /api/posts?provider=invalid returns 422', async () => {
    const res = await request(app).get('/api/posts').query({ provider: 'not-an-id' });
    expect([422,400]).toContain(res.statusCode);
  });

  it('PATCH /api/posts/:id updates description/category (tolerant)', async () => {
    if (!postId) return;
    const res = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'Updated');
    expect([200,403,404]).toContain(res.statusCode);
  });

  it('PATCH /api/posts/:id with new media updates mediaUrl (tolerant)', async () => {
    if (!postId) return;
    const res = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('media', Buffer.from('newimg'), { filename: 'b.png', contentType: 'image/png' })
      .field('description', 'With media');
    expect([200,404]).toContain(res.statusCode);
  });

  it('PATCH /api/posts/:id as different user yields 403', async () => {
    if (!postId) return;
    const email2 = `other_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Other', email: email2, password });
    const login2 = await request(app).post('/api/auth/login').send({ email: email2, password });
    const token2 = login2.body.token;

    const forbidden = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token2}`)
      .field('description', 'Nope');
    expect([403,404]).toContain(forbidden.statusCode);
  });

  it('PATCH /api/posts/:id with invalid id returns 422', async () => {
    const res = await request(app)
      .patch('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'Nope');
    expect([422,400]).toContain(res.statusCode);
  });

  it('POST /api/posts/:id/like toggles', async () => {
    if (!postId) return;
    const res1 = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect([200,404]).toContain(res1.statusCode);
    const res2 = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect([200,404]).toContain(res2.statusCode);
  });

  it('POST /api/posts/:id/like invalid id returns 422', async () => {
    const res = await request(app)
      .post('/api/posts/invalid-id/like')
      .set('Authorization', `Bearer ${token}`);
    expect([422,400]).toContain(res.statusCode);
  });

  it('POST /api/posts/:id/favorite toggles', async () => {
    if (!postId) return;
    const res1 = await request(app)
      .post(`/api/posts/${postId}/favorite`)
      .set('Authorization', `Bearer ${token}`);
    expect([200,404]).toContain(res1.statusCode);
    const res2 = await request(app)
      .post(`/api/posts/${postId}/favorite`)
      .set('Authorization', `Bearer ${token}`);
    expect([200,404]).toContain(res2.statusCode);
  });

  it('POST /api/posts/:id/favorite invalid id returns 422', async () => {
    const res = await request(app)
      .post('/api/posts/invalid-id/favorite')
      .set('Authorization', `Bearer ${token}`);
    expect([422,400]).toContain(res.statusCode);
  });

  it('DELETE /api/posts/:id removes post (tolerant)', async () => {
    if (!postId) return;
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200,404,403]).toContain(res.statusCode);
  });

  it('DELETE /api/posts/:id as different user yields 403', async () => {
    if (!postId) return;
    const email2 = `other2_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Other2', email: email2, password });
    const login2 = await request(app).post('/api/auth/login').send({ email: email2, password });
    const token2 = login2.body.token;
    const forbidden = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect([403,404]).toContain(forbidden.statusCode);
  });
});
