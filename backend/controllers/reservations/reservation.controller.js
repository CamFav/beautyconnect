const Reservation = require("../../models/Reservation");
const ProDetails = require("../../models/ProDetails");
const User = require("../../models/User");

// =====================
// Création d'une réservation
// =====================
exports.createReservation = async (req, res) => {
  try {
    console.log("BODY REÇU :", req.body);
    const clientId = req.user.id;
    const { proId, serviceId, date, time } = req.body;
    let { location } = req.body; // en let pour pouvoir le modifier

    if (!proId || !serviceId || !date || !time) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ error: "Date invalide (format attendu: YYYY-MM-DD)" });
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res
        .status(400)
        .json({ error: "Heure invalide (format attendu: HH:MM)" });
    }

    // Vérifie que la date/heure ne sont pas dans le passé
    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}:00`);
    if (selectedDateTime < now) {
      return res.status(400).json({
        error:
          "Impossible de réserver un créneau passé. Choisissez un horaire futur.",
      });
    }

    const details = await ProDetails.findOne({ proId });
    if (!details) return res.status(404).json({ error: "Pro introuvable" });

    const service = details.services.id(serviceId);
    if (!service) return res.status(404).json({ error: "Service introuvable" });

    const { name: serviceName, price, duration } = service;

    const dayEnglish = parsedDate
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase();
    console.log("Jour anglais utilisé :", dayEnglish);

    // filtre correctement par le champ 'day' de la base
    const dayRanges = details.availability
      .filter((item) => item.enabled)
      .filter((item) => item.day.toLowerCase() === dayEnglish)
      .flatMap((item) => item.slots || []);

    const requestedTime = new Date(`${date}T${time}:00`);
    const isInRange = dayRanges.some((range) => {
      if (!range.start || !range.end) return false;
      const start = new Date(`${date}T${range.start}:00`);
      const end = new Date(`${date}T${range.end}:00`);
      return requestedTime >= start && requestedTime < end;
    });

    if (!isInRange)
      return res.status(400).json({
        error: "Ce créneau n'est pas disponible dans les horaires du pro",
      });

    const conflict = await Reservation.findOne({ proId, date, time });
    if (conflict)
      return res.status(400).json({ error: "Ce créneau est déjà réservé" });

    // Conversion sécurisée de l'objet location en string
    if (typeof location === "object" && location !== null) {
      const loc = location;
      location = loc.city
        ? `${loc.city}${loc.country ? ", " + loc.country : ""}`
        : JSON.stringify(loc);
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
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

// =====================
// Récupérer réservations d’un client
// =====================
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
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

// =====================
// Récupérer réservations d’un pro
// =====================
exports.getByPro = async (req, res) => {
  try {
    const { proId } = req.params;

    const reservations = await Reservation.find({ proId })
      .populate("clientId", "name email") // récupère nom du client
      .sort({ date: 1, time: 1 });

    return res.json(reservations);
  } catch (err) {
    console.error("Erreur getByPro:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

// =====================
// Modifier le statut d'une réservation
// =====================
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!reservation)
      return res.status(404).json({ error: "Réservation introuvable" });

    return res.json(reservation);
  } catch (err) {
    console.error("Erreur updateStatus:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
