const ProDetails = require("../../models/ProDetails");
const sanitizeHtml = require("sanitize-html");

const sendError = (res, status, message, field) => {
  const payload = { message };
  if (field) {
    payload.errors = [{ field, message }];
  }
  return res.status(status).json(payload);
};

exports.getMyServices = async (req, res) => {
  try {
    const proId = req.user.id;
    const proDetails = await ProDetails.findOne({ proId }).lean();

    if (!proDetails || !Array.isArray(proDetails.services)) {
      return res.json([]);
    }

    res.json(proDetails.services);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur getMyServices :", error);
    }
    sendError(res, 500, "Erreur serveur.");
  }
};

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
      return sendError(
        res,
        400,
        "Champs requis et valides : name (string), price (number), duration (number).",
        "service"
      );
    }

    price = Number(price);
    duration = Number(duration);
    if (price < 0 || duration <= 0) {
      return sendError(
        res,
        400,
        "Le prix et la duree doivent etre des valeurs positives.",
        "price"
      );
    }

    name = sanitizeHtml(name.trim(), { allowedTags: [], allowedAttributes: {} });
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

    res.status(201).json(newService);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur createService :", error);
    }
    sendError(res, 500, "Erreur serveur.");
  }
};

exports.updateService = async (req, res) => {
  try {
    const proId = req.user.id;
    const serviceId = req.params.serviceId;
    const { name, price, duration, description } = req.body;

    const proDetails = await ProDetails.findOne({ proId });
    if (!proDetails) {
      return sendError(
        res,
        404,
        "Aucun service trouve pour ce professionnel.",
        "serviceId"
      );
    }

    const service = proDetails.services.id(serviceId);
    if (!service) {
      return sendError(res, 404, "Service introuvable.", "serviceId");
    }

    if (name !== undefined) {
      service.name = sanitizeHtml(String(name).trim(), {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
    if (price !== undefined) {
      const num = Number(price);
      if (Number.isNaN(num) || num < 0) {
        return sendError(res, 400, "Prix invalide.", "price");
      }
      service.price = num;
    }
    if (duration !== undefined) {
      const num = Number(duration);
      if (Number.isNaN(num) || num <= 0) {
        return sendError(res, 400, "Duree invalide.", "duration");
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
    res.json(service);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur updateService :", error);
    }
    sendError(res, 500, "Erreur serveur.");
  }
};

exports.deleteService = async (req, res) => {
  try {
    const proId = req.user.id;
    const { serviceId } = req.params;

    const updated = await ProDetails.updateOne(
      { proId },
      { $pull: { services: { _id: serviceId } } }
    );

    if (updated.modifiedCount === 0) {
      return sendError(res, 404, "Service introuvable.", "serviceId");
    }

    return res.status(200).json({ message: "Service supprime avec succes." });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur deleteService :", error);
    }
    sendError(res, 500, "Erreur serveur.");
  }
};

exports.getPublicServices = async (req, res) => {
  try {
    const proId = req.params.proId;
    if (!proId) {
      return sendError(res, 400, "proId requis.", "proId");
    }

    const proDetails = await ProDetails.findOne({ proId }).lean();
    if (!proDetails || !Array.isArray(proDetails.services)) {
      return res.json([]);
    }

    res.json(proDetails.services);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur getPublicServices :", error);
    }
    sendError(res, 500, "Erreur serveur.");
  }
};
