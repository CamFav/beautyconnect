module.exports = (app) => {
  app.use("/api/auth", require("./auth"));
  app.use("/api/account", require("./account"));
  app.use("/api/pro", require("./pro"));
  app.use("/api/posts", require("./posts"));

  // Routes users
  app.use("/api/users", require("./users/getPros")); // liste des pros
  app.use("/api/users", require("./users/follow")); // follow/unfollow
  app.use("/api/users", require("./users/avatar")); // avatar upload
  app.use("/api/users", require("./users/getOne")); // profil public
  app.use("/api/users", require("./users/getMany")); // profils multiples par ids

  // Routes réservations
  app.use("/api/reservations", require("./reservationsRoutes"));
};
