/**
 * Middleware de contrôle d'accès par rôle utilisateur.
 * @param {string|string[]} roleName - Rôle ou liste de rôles autorisés
 */

// Middleware de contrôle des rôles
module.exports = (roleName) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentification requise." });
  }

  const userRole = req.user.role;
  const allowedRoles = Array.isArray(roleName) ? roleName : [roleName];

  // Vérifie si l'utilisateur possède un des rôles requis
  if (!allowedRoles.includes(userRole)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `Accès refusé : ${
          req.user.email || "Utilisateur inconnu"
        } (${userRole}) → ${allowedRoles.join(", ")}`
      );
    }

    return res
      .status(403)
      .json({ message: "Accès refusé - autorisation insuffisante." });
  }

  next();
};
