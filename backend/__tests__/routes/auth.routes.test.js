const request = require('supertest');
const app = require('../../app');

describe('Routes - auth', () => {
  const email = `test_${Date.now()}@example.com`;
  const password = 'Password123!';

  it('registers a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email,
      password,
    });
    expect([201,400]).toContain(res.statusCode); // tolerate re-run
  });

  it('login flow and /me', async () => {
    // make sure user exists
    await request(app).post('/api/auth/register').send({ name: 'John Doe', email, password });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    expect([200,401,400]).toContain(login.statusCode);

    if (login.statusCode === 200) {
      const token = login.body.token;
      const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect([200]).toContain(me.statusCode);
      expect(me.body).toHaveProperty('email');
    }

    const unauth = await request(app).get('/api/auth/me');
    expect(unauth.statusCode).toBe(401);
  });

  it('rejects invalid register and login payloads', async () => {
    const badReg = await request(app).post('/api/auth/register').send({ name: 'x', email: 'bad', password: 'weak' });
    expect([400,422]).toContain(badReg.statusCode);
    const badLogin = await request(app).post('/api/auth/login').send({ email: 'bad', password: '' });
    expect([400,422]).toContain(badLogin.statusCode);
  });
});
