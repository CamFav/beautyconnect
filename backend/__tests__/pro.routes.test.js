process.env.JWT_SECRET = 'testsecret';
const { generateToken } = require('../utils/jwt');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');


let mongoServer;
let proToken;
let clientToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Création utilisateur PRO
  const proUser = await User.create({
    name: 'ProUser',
    email: 'pro@example.com',
    password: 'hashedpassword',
    role: 'pro'
  });
  proToken = generateToken(proUser);


  // Création d'un utilisateur CLIENT
  const clientUser = await User.create({
    name: 'ClientUser',
    email: 'client@example.com',
    password: 'hashedpassword',
    role: 'client'
  });
  clientToken = generateToken(clientUser);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('PRO ROUTES /api/pro/dashboard', () => {
  test('Retourne 401 si aucun token', async () => {
    const res = await request(app).get('/api/pro/dashboard');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token manquant|mal formé/i);
  });

  test('Retourne 403 si token valide mais role != pro', async () => {
    const res = await request(app)
      .get('/api/pro/dashboard')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/accès refusé/i);
  });

  test('Retourne 200 si rôle pro et token valide', async () => {
    const res = await request(app)
      .get('/api/pro/dashboard')
      .set('Authorization', `Bearer ${proToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      message: 'Bienvenue sur le dashboard PRO'
    });
  });
});
