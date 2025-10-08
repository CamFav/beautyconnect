process.env.JWT_SECRET = 'test_secret';

const { generateToken, verifyToken } = require('../utils/jwt');

describe('utils/jwt', () => {
  test('generateToken produit un token valide', () => {
    const payload = { id: '123', activeRole: 'client' };
    const token = generateToken(payload);

    expect(typeof token).toBe('string');
    const decoded = verifyToken(token);
    expect(decoded.sub).toBe(payload.id);
    expect(decoded.role).toBe(payload.role);
  });

  test('verifyToken rejette un token invalide', () => {
    expect(() => verifyToken('token_invalide')).toThrow();
  });
});
