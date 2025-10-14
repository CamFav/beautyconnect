const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// GET /api/users/getPros
router.get("/getPros", async (req, res) => {
  try {
    // Tous les users avec un proProfile défini
    const pros = await User.find({
      proProfile: { $exists: true, $ne: null }
    }).select("-password");

    console.log("=== PROS (avec proProfile) ===", pros.length);
    pros.forEach(u =>
      console.log(u.email, "=> activeRole:", u.activeRole)
    );

    res.json(pros);
  } catch (err) {
    console.error("Erreur récupération prestataires :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
