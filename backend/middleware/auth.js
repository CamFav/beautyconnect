const { verifyToken } = require('../utils/jwt');

/**
 * Middleware d'authentification
 * Vérifie token JWT
 * Si valide > ajoute les infos du user décodées à req.user
 * Sinon > renvoie une erreur 401
 */
const protect = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = { protect };
