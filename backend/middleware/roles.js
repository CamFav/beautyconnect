exports.requireRole = (roleName) => (req, res, next) => {
  if (!req.user || req.user.activeRole !== roleName) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  next();
};
