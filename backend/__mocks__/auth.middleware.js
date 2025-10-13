module.exports = (req, res, next) => {
  // Simule un utilisateur connecté
  req.user = {
    id: "fakeUserId",
    email: "test@example.com",
    role: "pro",
  };
  next();
};
