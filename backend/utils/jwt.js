const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error(
    "Erreur: la variable d’environnement JWT_SECRET est manquante."
  );
}

const JWT_ISSUER = "beautyconnect";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// Génération d’un token sécurisé
const generateToken = (user) => {
  if (!user) {
    throw new Error("Impossible de générer un token sans utilisateur.");
  }

  // Récupère l'ID user
  const userId = user._id || user.id || user.sub;
  if (!userId) {
    throw new Error(
      "L'utilisateur fourni pour le token ne possède pas d'identifiant valide."
    );
  }

  // Payload pour limiter l'exposition des informations dans le token
  const payload = {
    sub: String(userId),
    email: user.email || null,

    activeRole: user.activeRole || user.role || null,
  };

  // Token stateless pour aucune session stockée côté serveur
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
  });
};

// Vérification et décodage
const verifyToken = (token) => {
  if (!token) {
    throw new Error("Aucun token fourni.");
  }

  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: JWT_ISSUER,
  });
};

module.exports = { generateToken, verifyToken };
