const request = require('supertest');
const app = require('../../app');

describe('Routes - health', () => {
  it('GET / responds with service info', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('service');
  });

  it('GET /api/health responds ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status','ok');
  });
});

