const request = require('supertest');
const app = require('../../app');

describe('Routes - users (more branches)', () => {
  const password = 'Password123!';
  let token, id;

  beforeEach(async () => {
    const email = `users_more_${Date.now()}@ex.com`;
    await request(app).post('/api/auth/register').send({ name: 'User UU', email, password });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    token = login.body.token; id = login.body.user.id;
  });

  it('GET /api/users without ids returns 400', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/users/:id returns 404 for unknown', async () => {
    const res = await request(app).get('/api/users/69016f6f6f6f6f6f6f6f6f6f').set('Authorization', `Bearer ${token}`);
    expect([404]).toContain(res.statusCode);
  });

  it('GET /api/users/:id returns 200 for existing user', async () => {
    const email2 = `users_more_ok_${Date.now()}@ex.com`;
    await request(app).post('/api/auth/register').send({ name: 'User2', email: email2, password });
    const login2 = await request(app).post('/api/auth/login').send({ email: email2, password });
    const id2 = login2.body.user.id;
    const res = await request(app).get(`/api/users/${id2}`).set('Authorization', `Bearer ${token}`);
    expect([200]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('user');
  });

  it('GET /api/users/me/following returns empty list', async () => {
    const res = await request(app).get('/api/users/me/following').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('following');
  });
});
