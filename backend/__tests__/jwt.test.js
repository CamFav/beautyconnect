const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test_secret';
const { generateToken, verifyToken } = require('../utils/jwt');

describe('Utils - JWT', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret';
  });

  test('generateToken crée un token valide', () => {
    const mockUser = {
      _id: '1234567890',
      email: 'test@example.com',
      role: 'client'
    };

    const token = generateToken(mockUser);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded).toHaveProperty('sub', '1234567890');
    expect(decoded).toHaveProperty('email', 'test@example.com');
    expect(decoded).toHaveProperty('role', 'client');
    expect(decoded).toHaveProperty('iss', 'beautyconnect');
  });

  test('verifyToken retourne le payload si token valide', () => {
    const token = jwt.sign(
      { sub: 'abc', email: 'valid@example.com', role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '1h', issuer: 'beautyconnect' }
    );

    const decoded = verifyToken(token);

    expect(decoded).toHaveProperty('sub', 'abc');
    expect(decoded).toHaveProperty('email', 'valid@example.com');
    expect(decoded).toHaveProperty('role', 'client');
  });

  test('verifyToken échoue si mauvais secret', () => {
    const token = jwt.sign(
      { sub: 'abc', email: 'wrong@example.com' },
      'wrong_secret',
      { expiresIn: '1h', issuer: 'beautyconnect' }
    );

    expect(() => verifyToken(token)).toThrow();
  });

  test('verifyToken échoue si token expiré', () => {
    const expiredToken = jwt.sign(
      { sub: 'expired', email: 'expired@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: -1, issuer: 'beautyconnect' } // déjà expiré
    );

    expect(() => verifyToken(expiredToken)).toThrow('jwt expired');
  });
});
