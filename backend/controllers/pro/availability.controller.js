const ProDetails = require("../../models/ProDetails");

// UPDATE availability
exports.updateAvailability = async (req, res) => {
  try {
    const proId = req.user.id;
    const availability = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({
        message: "Format invalide : le corps doit être un tableau",
      });
    }

    // Validation simple : chaque élément doit avoir day + slots
    const valid = availability.every(
      (item) => typeof item.day === "string" && Array.isArray(item.slots)
    );
    if (!valid) {
      return res.status(400).json({
        message:
          "Chaque disponibilité doit contenir un day (string) et un tableau slots",
      });
    }

    const data = await ProDetails.findOneAndUpdate(
      { proId },
      { availability },
      { new: true, upsert: true }
    );

    return res.json({
      message: "Disponibilités mises à jour",
      availability: data.availability,
    });
  } catch (err) {
    console.error("Erreur updateAvailability:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET availability
// GET availability
exports.getAvailability = async (req, res) => {
  try {
    const proId = req.user.id;
    const data = await ProDetails.findOne({ proId });

    // renvoie juste le tableau pour que res.data soit utilisable directement
    return res.json(data?.availability || []);
  } catch (err) {
    console.error("Erreur getAvailability:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
