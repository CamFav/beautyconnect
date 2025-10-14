const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// GET /api/users?ids=1,2,3
router.get("/", async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ message: "Aucun ID fourni" });
    }

    const idsArray = ids.split(",");
    const users = await User.find({ _id: { $in: idsArray } })
      .select("name avatarPro avatarClient proProfile");

    res.json(users);
  } catch (error) {
    console.error("Erreur récupération multiples users:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
