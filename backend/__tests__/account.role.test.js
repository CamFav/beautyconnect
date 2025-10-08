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

  // créer un user en DB
  await User.create({
    name: 'RoleTest',
    email: 'role@test.com',
    password: 'pass123',
    role: 'client',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('PATCH /api/account/role', () => {
  test('change de rôle avec token valide', async () => {
    const user = await User.findOne({ email: 'role@test.com' });

    const token = generateToken({
      id: user._id,
      role: user.role
    });

    const res = await request(app)
      .patch('/api/account/role')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'pro' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.activeRole).toBe('pro');
    expect(res.body).toHaveProperty('token');
  });

  test('refuse rôle invalide', async () => {
    const user = await User.findOne({ email: 'role@test.com' });

    const token = generateToken({
      id: user._id,
      role: user.role
    });

    const res = await request(app)
      .patch('/api/account/role')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'adminLOL' });

    expect(res.statusCode).toBe(400);
  });

  test('refuse sans token', async () => {
    const res = await request(app)
      .patch('/api/account/role')
      .send({ role: 'pro' });

    expect(res.statusCode).toBe(401);
  });
});
