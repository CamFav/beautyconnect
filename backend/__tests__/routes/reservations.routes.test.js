const request = require('supertest');
const app = require('../../app');

describe('Routes - reservations', () => {
  const password = 'Password123!';
  let clientToken, clientId;

  beforeEach(async () => {
    const email = `res_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Client', email, password });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    clientToken = login.body.token;
    clientId = login.body.user.id;
  });

  it('POST /api/reservations validates', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/reservations/client/:clientId enforces ownership', async () => {
    const res = await request(app)
      .get(`/api/reservations/client/69016e8c8f8f8f8f8f8f8f8f`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect([400,403]).toContain(res.statusCode);

    const ok = await request(app)
      .get(`/api/reservations/client/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(ok.statusCode).toBe(200);
  });

  it('PATCH /api/reservations/:id/status validates id', async () => {
    const res = await request(app)
      .patch('/api/reservations/bad/status')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'confirmed' });
    expect(res.statusCode).toBe(400);
  });
});
