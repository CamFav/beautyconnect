const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// GET /api/users/getPros
router.get("/getPros", async (req, res) => {
  try {
    // Pros si role=pro, OU si un proProfile "réellement rempli"
    const pros = await User.find({
      $or: [
        { role: "pro" },
        {
          // filet de sécurité legacy: proProfile non vide
          $and: [
            { proProfile: { $exists: true, $ne: null } },
            {
              $or: [
                { "proProfile.businessName": { $ne: "" } },
                { "proProfile.services.0": { $exists: true } },
              ],
            },
          ],
        },
      ],
    })
      .select("-password")
      .lean();

    console.log("=== PROS VISIBLES DANS EXPLORER ===", pros.length);
    pros.forEach((u) =>
      console.log(u.email, "=> role:", u.role, "| activeRole:", u.activeRole)
    );

    res.json(pros);
  } catch (err) {
    console.error("Erreur récupération prestataires :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
