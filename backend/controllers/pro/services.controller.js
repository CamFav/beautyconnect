const ProDetails = require("../../models/ProDetails");
const sanitizeHtml = require("sanitize-html");

// ================================
// GET mes services (pro connecté)
// ================================
exports.getMyServices = async (req, res) => {
  try {
    const proId = req.user.id;
    const proDetails = await ProDetails.findOne({ proId }).lean();

    if (!proDetails || !Array.isArray(proDetails.services)) {
      return res.json([]); // retour tableau brut pour compatibilité front
    }

    res.json(proDetails.services); // tableau direct
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur getMyServices :", error);
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================================
// CREATE service
// ================================
exports.createService = async (req, res) => {
  try {
    const proId = req.user.id;
    let { name, price, duration, description } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      isNaN(Number(price)) ||
      isNaN(Number(duration))
    ) {
      return res.status(400).json({
        message:
          "Champs requis et valides : name (string), price (number), duration (number)",
      });
    }

    price = Number(price);
    duration = Number(duration);
    if (price < 0 || duration <= 0) {
      return res.status(400).json({
        message: "Le prix et la durée doivent être des valeurs positives.",
      });
    }

    name = sanitizeHtml(name.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    });
    description = sanitizeHtml(description?.trim() || "", {
      allowedTags: [],
      allowedAttributes: {},
    });

    let proDetails = await ProDetails.findOne({ proId });
    if (!proDetails) {
      proDetails = await ProDetails.create({ proId, services: [] });
    }

    const newService = { name, price, duration, description };
    proDetails.services.push(newService);
    await proDetails.save();

    res.status(201).json(newService); // retour direct du service créé
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur createService :", error);
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================================
// UPDATE service
// ================================
exports.updateService = async (req, res) => {
  try {
    const proId = req.user.id;
    const serviceId = req.params.serviceId;
    const { name, price, duration, description } = req.body;

    const proDetails = await ProDetails.findOne({ proId });
    if (!proDetails) {
      return res
        .status(404)
        .json({ message: "Aucun service trouvé pour ce pro." });
    }

    const service = proDetails.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service introuvable." });
    }

    if (name !== undefined) {
      service.name = sanitizeHtml(String(name).trim(), {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
    if (price !== undefined) {
      const num = Number(price);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ message: "Prix invalide." });
      }
      service.price = num;
    }
    if (duration !== undefined) {
      const num = Number(duration);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ message: "Durée invalide." });
      }
      service.duration = num;
    }
    if (description !== undefined) {
      service.description = sanitizeHtml(String(description || "").trim(), {
        allowedTags: [],
        allowedAttributes: {},
      });
    }

    await proDetails.save();
    res.json(service); // ✅ retour direct du service mis à jour
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur updateService :", error);
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================================
// DELETE service
// ================================
exports.deleteService = async (req, res) => {
  try {
    const proId = req.user.id;
    const { serviceId } = req.params;

    const updated = await ProDetails.updateOne(
      { proId },
      { $pull: { services: { _id: serviceId } } }
    );

    if (updated.modifiedCount === 0) {
      return res.status(404).json({ message: "Service introuvable." });
    }

    return res.status(200).json({ message: "Service supprimé avec succès." });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur deleteService :", error);
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================================
// GET services publics d'un PRO
// ================================
exports.getPublicServices = async (req, res) => {
  try {
    const proId = req.params.proId;
    if (!proId) {
      return res.status(400).json({ message: "proId requis" });
    }

    const proDetails = await ProDetails.findOne({ proId }).lean();
    if (!proDetails || !Array.isArray(proDetails.services)) {
      return res.json([]); // 🔄 tableau brut pour compatibilité
    }

    res.json(proDetails.services);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur getPublicServices :", error);
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
};
