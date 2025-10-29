const request = require('supertest');
const app = require('../../app');

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const nextWeekday = (weekday) => {
  const map = { sunday:0, monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6 };
  const target = map[weekday];
  const now = new Date();
  const d = new Date(now);
  const diff = (target - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return formatDate(d);
};

describe('E2E - reservations happy path', () => {
  const password = 'Password123!';
  let proToken, proId, clientToken, clientId, serviceId, reservationId;

  it('creates reservation end-to-end and updates status', async () => {
    // Create PRO user and switch role to pro
    const proEmail = `pro_res_${Date.now()}@ex.com`;
    await request(app).post('/api/auth/register').send({ name: 'Pro Res', email: proEmail, password });
    const proLogin = await request(app).post('/api/auth/login').send({ email: proEmail, password });
    proToken = proLogin.body.token; proId = proLogin.body.user.id;
    const roleRes = await request(app).patch('/api/account/role').set('Authorization', `Bearer ${proToken}`).send({ role: 'pro' });
    if (roleRes.body && roleRes.body.token) {
      proToken = roleRes.body.token;
    }

    // Create service
    const created = await request(app)
      .post('/api/pro/services')
      .set('Authorization', `Bearer ${proToken}`)
      .send({ name: 'Coupe', price: 20, duration: 30, description: 'ok' });
    expect(created.statusCode).toBe(201);
    // fetch service id via GET services
    const list = await request(app)
      .get('/api/pro/services')
      .set('Authorization', `Bearer ${proToken}`);
    serviceId = (list.body[0] && (list.body[0]._id || list.body[0].id)) || undefined;

    // Set availability
    const date = nextWeekday('thursday');
    await request(app)
      .put('/api/pro/availability')
      .set('Authorization', `Bearer ${proToken}`)
      .send([{ day: 'thursday', enabled: true, slots: [{ start: '10:00', end: '12:00' }] }]);

    // Create CLIENT
    const clientEmail = `client_res_${Date.now()}@ex.com`;
    await request(app).post('/api/auth/register').send({ name: 'Client Res', email: clientEmail, password });
    const clientLogin = await request(app).post('/api/auth/login').send({ email: clientEmail, password });
    clientToken = clientLogin.body.token; clientId = clientLogin.body.user.id;

    // Create reservation
    const createdRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ proId, serviceId, date, time: '10:00' });
    expect([200]).toContain(createdRes.statusCode);
    reservationId = createdRes.body._id || createdRes.body.id;

    // List by client
    const listClient = await request(app)
      .get(`/api/reservations/client/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(listClient.statusCode).toBe(200);

    // List by pro
    const listPro = await request(app)
      .get(`/api/reservations/pro/${proId}`)
      .set('Authorization', `Bearer ${proToken}`);
    expect([200]).toContain(listPro.statusCode);

    // Update status
    const upd = await request(app)
      .patch(`/api/reservations/${reservationId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'confirmed' });
    expect([200]).toContain(upd.statusCode);
    if (upd.statusCode === 200) {
      expect(upd.body).toEqual(expect.objectContaining({ status: 'confirmed' }));
    }
  });
});
