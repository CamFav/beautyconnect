const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Middleware protect', () => {
  let validToken;

  beforeAll(async () => {
    const user = await User.create({
      name: 'TestUser',
      email: 'test@example.com',
      password: 'password123',
      role: 'client'
    });

    validToken = jwt.sign(
      { sub: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h', issuer: 'beautyconnect' }
    );
  });

  // Pas d’Authorization
  test('Refuse si absence de header Authorization', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });

  // Mauvais format
  test('Refuse si format du header invalide', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Token abc123');
    expect(res.statusCode).toBe(401);
  });

  // Token invalide
  test('Refuse si token incorrect', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer mauvais_token');
    expect(res.statusCode).toBe(401);
  });

  // Token expiré
  test('Refuse si token expiré', async () => {
    const expired = jwt.sign(
      { sub: 'fakeUserId', email: 'expired@example.com', role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: -1, issuer: 'beautyconnect' }
    );

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${expired}`);
    expect(res.statusCode).toBe(401);
  });

  // Token valide
  test('Autorise avec un token valide', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.statusCode).toBe(200);
  });
});
