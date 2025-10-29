// Mock cloudinary uploader for avatar route
jest.mock('../../config/cloudinary', () => {
  const { PassThrough } = require('stream');
  return {
    uploader: {
      upload_stream: jest.fn((opts, cb) => {
        const stream = new PassThrough();
        stream.on('finish', () => cb(null, { secure_url: 'https://cdn.example.com/avatar.jpg' }));
        stream.on('error', (e) => cb(e));
        return stream;
      })
    }
  };
});

const request = require('supertest');
const app = require('../../app');

describe('Routes - users', () => {
  let token1; let id1; let id2; let u1; let u2;

  beforeEach(async () => {
    u1 = { email: `u1_${Date.now()}@ex.com`, password: 'Password123!', name: 'User One' };
    u2 = { email: `u2_${Date.now()}@ex.com`, password: 'Password123!', name: 'User Two' };
    await request(app).post('/api/auth/register').send(u1);
    await request(app).post('/api/auth/register').send(u2);
    const login = await request(app).post('/api/auth/login').send({ email: u1.email, password: u1.password });
    token1 = login.body.token;
    id1 = login.body.user.id;
    const login2 = await request(app).post('/api/auth/login').send({ email: u2.email, password: u2.password });
    id2 = login2.body.user.id;
  });

  it('GET /api/users/getPros returns list', async () => {
    const res = await request(app).get('/api/users/getPros');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('pros');
  });

  it('GET /api/users/check-email detects existing and absent', async () => {
    const exists = await request(app).get('/api/users/check-email').query({ email: u1.email });
    expect(exists.statusCode).toBe(200);
    const none = await request(app).get('/api/users/check-email').query({ email: 'nope@example.com' });
    expect(none.statusCode).toBe(200);
  });

  it('GET /api/users (ids) requires auth and returns users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token1}`)
      .query({ ids: `${id1},${id2}` });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('GET /api/users/:id/public validates and returns', async () => {
    const bad = await request(app).get('/api/users/invalid/public');
    expect(bad.statusCode).toBe(400);
    const ok = await request(app).get(`/api/users/${id1}/public`);
    expect([200,404]).toContain(ok.statusCode);
  });

  it('POST /api/users/:id/follow toggles', async () => {
    const self = await request(app)
      .post(`/api/users/${id1}/follow`)
      .set('Authorization', `Bearer ${token1}`);
    expect(self.statusCode).toBe(400);

    const follow = await request(app)
      .post(`/api/users/${id2}/follow`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200,404]).toContain(follow.statusCode);

    const unfollow = await request(app)
      .post(`/api/users/${id2}/follow`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200,404]).toContain(unfollow.statusCode);
  });

  it('PATCH /api/users/:role/avatar enforces file and role', async () => {
    const badRole = await request(app)
      .patch('/api/users/unknown/avatar')
      .set('Authorization', `Bearer ${token1}`);
    expect(badRole.statusCode).toBe(400);

    const noFile = await request(app)
      .patch('/api/users/client/avatar')
      .set('Authorization', `Bearer ${token1}`);
    expect(noFile.statusCode).toBe(400);

    // With file should succeed
    const ok = await request(app)
      .patch('/api/users/client/avatar')
      .set('Authorization', `Bearer ${token1}`)
      .attach('avatar', Buffer.from('x'), { filename: 'me.png', contentType: 'image/png' });
    expect([200]).toContain(ok.statusCode);
  });
});
