const ProDetails = require("../models/ProDetails");

// UPDATE availability for a pro
exports.updateAvailability = async (req, res) => {
  try {
    const { proId } = req.params;
    const { availability } = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({
        message: "Format invalide : 'availability' doit être un tableau",
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

// GET - Récupérer les disponibilités d'un pro
exports.getAvailability = async (req, res) => {
  try {
    const { proId } = req.params;

    const data = await ProDetails.findOne({ proId });
    if (!data) {
      return res.json({ availability: [] }); // Aucun planning encore défini
    }

    return res.json({
      proId,
      availability: data.availability,
    });
  } catch (err) {
    console.error("Erreur getAvailability:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
