module.exports = (app) => {
  // ================================
  // Health check route
  // ================================
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ================================
  // Auth & Account
  // ================================
  app.use("/api/auth", require("./auth.routes"));
  app.use("/api/account", require("./account.routes"));

  // ================================
  // Pros
  // ================================
  app.use("/api/pro", require("./pro.routes"));

  // ================================
  // Posts
  // ================================
  app.use("/api/posts", require("./posts.routes"));

  // ================================
  // Users
  // ================================
  app.use("/api/users", require("./users.routes"));

  // ================================
  // Reservations
  // ================================
  app.use("/api/reservations", require("./reservations.routes"));

  // ================================
  // Global Error Handler
  // ================================
  app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== "production")
      console.error("Erreur non capturée :", err);
    res.status(err.status || 500).json({
      message: err.message || "Erreur serveur interne",
    });
  });

  // ================================
  // Dev log
  // ================================
  if (process.env.NODE_ENV !== "production") {
    console.log("Routes montées :");
    console.log("   - /api/health");
    console.log("   - /api/auth");
    console.log("   - /api/account");
    console.log("   - /api/pro");
    console.log("   - /api/posts");
    console.log("   - /api/users");
    console.log("   - /api/reservations");
  }
};
