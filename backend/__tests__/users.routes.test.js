const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('/api/users', () => {

  test('GET sans token → 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  test('GET avec token valide > 200 et retourne tableau', async () => {
    const user = await User.create({
      name: 'TestUser',
      email: 'test@example.com',
      password: '123456',
      role: 'client'
    });

    const token = generateToken(user);

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST → 403 et bloque création', async () => {
    const user = await User.create({
      name: 'TestUser2',
      email: 'test2@example.com',
      password: '123456',
      role: 'client'
    });

    const token = generateToken(user);

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Hacker',
        email: 'hack@example.com',
        password: 'test'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/interdite/i);
  });

});
