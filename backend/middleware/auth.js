const { verifyToken } = require('../utils/jwt');

/**
 * Middleware d'authentification JWT
 * Vérifie le token.
 * Sinon > renvoie 401 avec message clair
 */
const protect = (req, res, next) => {
  const header = req.headers.authorization || '';

  // Vérifie que le header commence bien par "Bearer"
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou mal formé' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = { protect };
