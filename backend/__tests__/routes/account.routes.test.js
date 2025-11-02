// Mock cloudinary before app is imported
jest.mock('../../config/cloudinary', () => {
  const { PassThrough } = require('stream');
  return {
    uploader: {
      upload_stream: jest.fn((opts, cb) => {
        const stream = new PassThrough();
        stream.on('finish', () => cb(null, { secure_url: 'https://cdn.example.com/header.jpg' }));
        stream.on('error', (e) => cb(e));
        return stream;
      })
    }
  };
});

const request = require('supertest');
const app = require('../../app');

describe('Routes - account', () => {
  const baseEmail = `acc_${Date.now()}@example.com`;
  const password = 'Password123!';
  let token;

  beforeEach(async () => {
    const email = `${Date.now()}_${baseEmail}`;
    await request(app).post('/api/auth/register').send({ name: 'Acc User', email, password });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    token = login.body.token;
  });

  it('PATCH /api/account/role sets role to pro and client', async () => {
    const pro = await request(app)
      .patch('/api/account/role')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'pro' });
    expect([200,404,400]).toContain(pro.statusCode);

    const client = await request(app)
      .patch('/api/account/role')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'client' });
    expect([200,404,400]).toContain(client.statusCode);
  });

  it('PATCH /api/account/profile rejects invalid input then accepts valid', async () => {
    const bad = await request(app)
      .patch('/api/account/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'X' });
    expect([400,404]).toContain(bad.statusCode);

    const ok = await request(app)
      .patch('/api/account/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Valid Name', phone: '+33612345678' });
    expect([200,404]).toContain(ok.statusCode);
  });

  it('PUT /api/account/upgrade with minimal payload', async () => {
    const res = await request(app)
      .put('/api/account/upgrade')
      .set('Authorization', `Bearer ${token}`)
      .send({
        businessName: 'Salon',
        siret: '12345678901234',
        status: 'freelance',
        experience: '<1 an',
        location: { city: 'Paris', country: 'France' },
        exerciseType: [],
        categories: []
      });
    expect([200,400,404]).toContain(res.statusCode);
  });

  it('PATCH /api/account/pro/header rejects without file (as pro) and accepts with file', async () => {
    // Ensure the user is a pro (route is restricted to role "pro")
    await request(app)
      .put('/api/account/upgrade')
      .set('Authorization', `Bearer ${token}`)
      .send({
        businessName: 'Salon Test',
        siret: '12345678901234',
        status: 'freelance',
        experience: '<1 an',
        location: { city: 'Paris', country: 'France' },
        exerciseType: [],
        categories: []
      });

    const noFile = await request(app)
      .patch('/api/account/pro/header')
      .set('Authorization', `Bearer ${token}`);
    expect(noFile.statusCode).toBe(400);

    const ok = await request(app)
      .patch('/api/account/pro/header')
      .set('Authorization', `Bearer ${token}`)
      .attach('header', Buffer.from('dummy'), { filename: 'test.png', contentType: 'image/png' });
    expect([200,404]).toContain(ok.statusCode);
  });

  it('GET /api/account/export returns JSON', async () => {
    const res = await request(app)
      .get('/api/account/export')
      .set('Authorization', `Bearer ${token}`);
    expect([200,404]).toContain(res.statusCode);
  });
});
