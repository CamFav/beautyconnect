const jwt = require('jsonwebtoken');

// Genere un token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'defaultsecret', {
    expiresIn: '7d', // valide 7 jours
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
};

module.exports = { generateToken, verifyToken };
