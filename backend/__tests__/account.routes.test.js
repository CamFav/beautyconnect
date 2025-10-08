const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

let mongoServer;
let user;
let token;

beforeAll(async () => {
  // Démarrage d'une DB en mémoire
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // User test
  user = await User.create({
    name: 'John Doe',
    email: 'test-account@example.com',
    password: 'password123',
    role: 'client',
  });

  // Génération d'un token
  token = generateToken({ id: user._id, role: user.role });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('PATCH /api/account/role', () => {
  test('401 si pas de token', async () => {
    const res = await request(app)
      .patch('/api/account/role')
      .send({ role: 'pro' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('400 si rôle invalide', async () => {
    const res = await request(app)
      .patch('/api/account/role')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'hacker' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Rôle invalide');
  });

  test('✅ 200 si mise à jour correcte', async () => {
    const res = await request(app)
      .patch('/api/account/role')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'pro' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('activeRole', 'pro');
    expect(res.body).toHaveProperty('token');
  });
});
