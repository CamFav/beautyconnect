const { sign, verify } = require('jsonwebtoken');

// Ensure secret is present before requiring module
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
const { generateToken } = require('../../utils/jwt');

describe('Utils - jwt', () => {
  it('generateToken returns a signed JWT with activeRole', () => {
    const token = generateToken({ id: 'u1', email: 'a@b.com', activeRole: 'pro' });
    const decoded = verify(token, process.env.JWT_SECRET);
    expect(decoded.sub || decoded.id).toBe('u1');
    expect(decoded.activeRole || decoded.role).toBe('pro');
  });

  it('compatible with jsonwebtoken verify', () => {
    const token = sign({ sub: 'u2', activeRole: 'client' }, process.env.JWT_SECRET);
    const decoded = verify(token, process.env.JWT_SECRET);
    expect(decoded.sub).toBe('u2');
  });

  it('throws if JWT_SECRET missing when requiring module', () => {
    const prev = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    expect(() => {
      jest.isolateModules(() => {
        // eslint-disable-next-line global-require
        require('../../utils/jwt');
      });
    }).toThrow();
    process.env.JWT_SECRET = prev;
  });

  it('generateToken errors on missing user or id; verifyToken errors on missing token', () => {
    const { generateToken, verifyToken } = require('../../utils/jwt');
    expect(() => generateToken()).toThrow();
    expect(() => generateToken({ email: 'x@y.com' })).toThrow();
    expect(() => verifyToken()).toThrow();
  });

  it('verifyToken returns payload and enforces issuer', () => {
    const { generateToken, verifyToken } = require('../../utils/jwt');
    const token = generateToken({ id: 'u3', email: 'x@y.com', role: 'client' });
    const decoded = verifyToken(token);
    expect(decoded.sub).toBe('u3');

    // sign with wrong issuer and expect verifyToken to throw
    const bad = sign({ sub: 'u4' }, process.env.JWT_SECRET, { issuer: 'other' });
    expect(() => verifyToken(bad)).toThrow();
  });
});
