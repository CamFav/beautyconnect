module.exports = (app) => {
  // Auth & Account
  app.use("/api/auth", require("./auth"));
  app.use("/api/account", require("./account"));

  // Pros
  app.use("/api/pro", require("./pro"));

  // Posts
  app.use("/api/posts", require("./posts"));

  // Users
  app.use("/api/users", require("./users"));

  // Reservations
  app.use("/api/reservations", require("./reservations"));
};
