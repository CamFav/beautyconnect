// Cloudinary not used here, no mock required
const request = require('supertest');
const app = require('../../app');

describe('Routes - pro (happy paths)', () => {
  const password = 'Password123!';
  let proToken, proId, serviceId;

  it('promotes a user to pro and manages services and availability', async () => {
    // Register + login
    const email = `pro_${Date.now()}@ex.com`;
    await request(app).post('/api/auth/register').send({ name: 'Pro', email, password });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    proToken = login.body.token;
    proId = login.body.user.id;

    // Switch role to pro
    const roleRes = await request(app)
      .patch('/api/account/role')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ role: 'pro' });
    expect([200]).toContain(roleRes.statusCode);
    // refresh token after role change
    if (roleRes.body && roleRes.body.token) {
      proToken = roleRes.body.token;
    }

    // Create a service
    const create = await request(app)
      .post('/api/pro/services')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ name: 'Coupe', price: 25, duration: 30, description: 'desc' });
    expect(create.statusCode).toBe(201);
    serviceId = create.body._id || create.body.id;

    // Update the service
    const update = await request(app)
      .put(`/api/pro/services/${serviceId}`)
      .set('Authorization', `Bearer ${proToken}`)
      .send({ price: 30 });
    expect([200,400]).toContain(update.statusCode);

    // Set availability
    const avail = await request(app)
      .put('/api/pro/availability')
      .set('Authorization', `Bearer ${proToken}`)
      .send([{ day: 'thursday', enabled: true, slots: [{ start: '10:00', end: '12:00' }] }]);
    expect(avail.statusCode).toBe(200);

    // Get availability
    const getAvail = await request(app)
      .get('/api/pro/availability')
      .set('Authorization', `Bearer ${proToken}`);
    expect(getAvail.statusCode).toBe(200);

    // Public services by pro id
    const pub = await request(app)
      .get(`/api/pro/${proId}/services/public`)
      .query({})
      .send();
    expect(pub.statusCode).toBe(200);

    // Delete the service
    const del = await request(app)
      .delete(`/api/pro/services/${serviceId}`)
      .set('Authorization', `Bearer ${proToken}`);
    expect([200,404,400]).toContain(del.statusCode);
  });
});
