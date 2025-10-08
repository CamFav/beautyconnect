const request = require('supertest');
const express = require('express');

process.env.JWT_SECRET = 'test_secret';

const { protect } = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');

const app = express();
app.use(express.json());

// route protégée pour tester le middleware
app.get('/protected', protect, (req, res) => {
  res.json({ message: 'Accès autorisé', user: req.user });
});

describe('Middleware protect', () => {
  test('Refuse sans header Authorization', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('Refuse si header mal formé', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer'); // pas de token
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('Refuse si token invalide', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer bad.token.here');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalide|bad/i);
  });

  test('Autorise avec token valide', async () => {
    const token = generateToken({
      _id: '123abc',
      email: 'test@example.com',
      role: 'client'
    });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });
});
