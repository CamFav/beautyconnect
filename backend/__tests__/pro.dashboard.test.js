const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const { generateToken } = require('../utils/jwt');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Users pour les tests
  await User.create([
    { name: 'ClientUser', email: 'client@test.com', password: 'pass123', role: 'client' },
    { name: 'ProUser', email: 'pro@test.com', password: 'pass123', role: 'pro' }
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /api/pro/dashboard', () => {
  test('autorise accès si user PRO', async () => {
    const user = await User.findOne({ email: 'pro@test.com' });
    const token = generateToken({ id: user._id, role: 'pro' });

    const res = await request(app)
      .get('/api/pro/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Bienvenue sur le dashboard PRO');
  });

  test('refuse si user CLIENT', async () => {
    const user = await User.findOne({ email: 'client@test.com' });
    const token = generateToken({ id: user._id, role: 'client' });

    const res = await request(app)
      .get('/api/pro/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  test('refuse sans token', async () => {
    const res = await request(app)
      .get('/api/pro/dashboard');

    expect(res.statusCode).toBe(401);
  });

  test('refuse token invalide', async () => {
    const res = await request(app)
      .get('/api/pro/dashboard')
      .set('Authorization', 'Bearer FAUXTOKEN123');

    expect(res.statusCode).toBe(401);
  });
});
