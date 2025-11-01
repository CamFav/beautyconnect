exports.getDashboard = (req, res) => {
  try {
    res.status(200).json({
      status: "ok",
      message: "Bienvenue sur le dashboard PRO",
      user: {
        id: req.user?.id || null,
        role: req.user?.role || "unknown",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur getDashboard:", err);
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
};
