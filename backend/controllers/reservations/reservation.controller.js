const Reservation = require("../../models/Reservation");
const ProDetails = require("../../models/ProDetails");

const sendError = (res, status, message, field) => {
  const payload = { message };
  if (field) {
    payload.errors = [{ field, message }];
  }
  return res.status(status).json(payload);
};

exports.createReservation = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { proId, serviceId, date, time } = req.body;
    let { location } = req.body;

    if (!proId || !serviceId || !date || !time) {
      return sendError(res, 400, "Champs requis manquants.", "reservation");
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return sendError(
        res,
        400,
        "Date invalide (format attendu: YYYY-MM-DD).",
        "date"
      );
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      return sendError(
        res,
        400,
        "Heure invalide (format attendu: HH:MM).",
        "time"
      );
    }

    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}:00`);
    if (selectedDateTime < now) {
      return sendError(
        res,
        400,
        "Impossible de reserver un creneau passe. Choisissez un horaire futur.",
        "time"
      );
    }

    const details = await ProDetails.findOne({ proId });
    if (!details) {
      return sendError(res, 404, "Professionnel introuvable.", "proId");
    }

    const service = details.services.id(serviceId);
    if (!service) {
      return sendError(res, 404, "Service introuvable.", "serviceId");
    }

    const { name: serviceName, price, duration } = service;

    const dayEnglish = parsedDate
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase();

    const dayRanges =
      details.availability
        ?.filter((item) => item.enabled)
        ?.filter(
          (item) =>
            typeof item.day === "string" &&
            item.day.toLowerCase() === dayEnglish
        )
        ?.flatMap((item) => item.slots || []) || [];

    const requestedTime = new Date(`${date}T${time}:00`);
    const isInRange = dayRanges.some((range) => {
      if (!range.start || !range.end) return false;
      const start = new Date(`${date}T${range.start}:00`);
      const end = new Date(`${date}T${range.end}:00`);
      return requestedTime >= start && requestedTime < end;
    });

    if (!isInRange) {
      return sendError(
        res,
        400,
        "Ce creneau n'est pas disponible dans les horaires du pro.",
        "time"
      );
    }

    const conflict = await Reservation.findOne({ proId, date, time });
    if (conflict) {
      return sendError(
        res,
        400,
        "Ce creneau est deja reserve.",
        "time"
      );
    }

    if (typeof location === "object" && location !== null) {
      const city = location.city ? location.city : "";
      const country = location.country ? `, ${location.country}` : "";
      location = city ? `${city}${country}` : JSON.stringify(location);
    }

    const reservation = await Reservation.create({
      clientId,
      proId,
      serviceName,
      price,
      duration,
      date,
      time,
      location,
      status: "pending",
    });

    return res.json(reservation);
  } catch (err) {
    console.error("Erreur createReservation:", err);
    return sendError(res, 500, "Erreur serveur.");
  }
};

exports.getByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const reservations = await Reservation.find({
      clientId,
      status: { $ne: "cancelled" },
    })
      .populate(
        "proId",
        "name proProfile.businessName proProfile.location avatarPro"
      )
      .sort({ date: 1, time: 1 });

    return res.json(reservations);
  } catch (err) {
    console.error("Erreur getByClient:", err);
    return sendError(res, 500, "Erreur serveur.");
  }
};

exports.getByPro = async (req, res) => {
  try {
    const { proId } = req.params;

    const reservations = await Reservation.find({ proId })
      .populate("clientId", "name email avatarClient")
      .sort({ date: 1, time: 1 });

    return res.json(reservations);
  } catch (err) {
    console.error("Erreur getByPro:", err);
    return sendError(res, 500, "Erreur serveur.");
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!reservation) {
      return sendError(res, 404, "Reservation introuvable.", "id");
    }

    return res.json(reservation);
  } catch (err) {
    console.error("Erreur updateStatus:", err);
    return sendError(res, 500, "Erreur serveur.");
  }
};
