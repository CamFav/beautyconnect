// Vérifie qu'un utilisateur a un rôle précis
exports.requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  next();
};
