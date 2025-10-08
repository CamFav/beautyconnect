const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  throw new Error('Erreur: la variable d’environnement JWT_SECRET est manquante.');
}

const JWT_ISSUER = 'beautyconnect';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Génère un token
const generateToken = (user) => {
  const raw = user && (user._id || user.id || user.sub || user);
  const sub = raw ? String(raw) : undefined;

  const payload = {
    sub,
    email: user && user.email,
    // activeRole si présent, sinon l’ancien champ role
    activeRole: (user && user.activeRole) || (user && user.role),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
  });
};

// Vérifie et décode un token JWT
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, { issuer: JWT_ISSUER });
};

module.exports = { generateToken, verifyToken };
