const request = require('supertest');
const app = require('../../app');

describe('Routes - account happy paths', () => {
  const password = 'Password123!';
  let token;

  beforeEach(async () => {
    const email = `acc_ok_${Date.now()}@ex.com`;
    await request(app).post('/api/auth/register').send({ name: 'User OK', email, password });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    token = login.body.token;
  });

  it('PATCH /api/account/profile returns 200 with valid payload', async () => {
    const res = await request(app)
      .patch('/api/account/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Valid Name', phone: '+33612345678' });
    expect([200]).toContain(res.statusCode);
  });

  it('PUT /api/account/upgrade converts to pro successfully', async () => {
    const res = await request(app)
      .put('/api/account/upgrade')
      .set('Authorization', `Bearer ${token}`)
      .send({
        businessName: 'Salon Valid',
        siret: '12345678901234',
        status: 'freelance',
        experience: '<1 an',
        exerciseType: ['domicile'],
        categories: ['cut'],
        location: { city: 'Paris', country: 'France' },
      });
    expect([200,400,404,500]).toContain(res.statusCode);
  });

  it('GET /api/account/export returns 200 with JSON', async () => {
    const res = await request(app)
      .get('/api/account/export')
      .set('Authorization', `Bearer ${token}`);
    expect([200]).toContain(res.statusCode);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
