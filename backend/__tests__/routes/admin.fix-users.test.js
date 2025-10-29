const request = require('supertest');

describe('Route - /admin/fix-users', () => {
  it('returns 403 without key and 200 with valid key', async () => {
    process.env.ADMIN_KEY = 'secret';
    const app = require('../../app');

    const forbidden = await request(app).get('/admin/fix-users');
    expect(forbidden.statusCode).toBe(403);

    const ok = await request(app).get('/admin/fix-users').set('x-admin-key', 'secret');
    expect([200]).toContain(ok.statusCode);
  });
});

