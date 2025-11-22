const jwt = require("jsonwebtoken");

/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token et injecte les infos utilisateur dans req.user
 */
exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentification requise ou token manquant.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Vérification et décodage du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérification expiration manuelle
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ message: "Token expiré." });
    }

    // Extraction de l'ID utilisateur
    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Token invalide: identifiant manquant." });
    }

    // Injection des infos utilisateur dans req.user
    req.user = {
      id: userId,
      email: decoded.email || null,
      role: decoded.activeRole || decoded.role || null,
    };

    next();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur middleware protect:", err);
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expiré." });
    }

    return res.status(401).json({
      message: "Authentification requise ou token invalide.",
    });
  }
};
