const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const User = require("../../models/User");

// GET /api/users/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Erreur get user:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
