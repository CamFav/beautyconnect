const Reservation = require("../models/Reservation");
const ProDetails = require("../models/ProDetails");

const REQUIRED_CREATE_FIELDS = [
  "clientId",
  "proId",
  "serviceName",
  "price",
  "duration",
  "date",
  "time",
];

exports.createReservation = async (req, res) => {
  try {
    const {
      clientId,
      proId,
      serviceName,
      price,
      duration,
      date,
      time,
      location,
    } = req.body;

    if (
      !clientId ||
      !proId ||
      !serviceName ||
      !price ||
      !duration ||
      !date ||
      !time
    ) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    // Vérifie si le créneau fait bien partie des disponibilités du pro
    const details = await ProDetails.findOne({ proId });
    if (!details || !details.availability.length) {
      return res
        .status(400)
        .json({ error: "Le pro n'a défini aucune disponibilité" });
    }

    const dayName = new Date(date)
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase(); // "monday"

    const dayRanges = details.availability.filter(
      (item) => item.dayOfWeek.toLowerCase() === dayName
    );

    if (!dayRanges.length) {
      return res
        .status(400)
        .json({ error: "Le pro n'est pas disponible ce jour-là" });
    }

    // Vérifie que l'heure voulue est dans une plage disponible
    const isInRange = dayRanges.some((range) => {
      return time >= range.start && time < range.end;
    });

    if (!isInRange) {
      return res.status(400).json({
        error: "Ce créneau n'est pas disponible dans les horaires du pro",
      });
    }

    // Vérifie que ce créneau n'est pas déjà réservé
    const conflict = await Reservation.findOne({ proId, date, time });
    if (conflict) {
      return res.status(400).json({ error: "Ce créneau est déjà réservé" });
    }

    // 3Si OK > on enregistre
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

exports.getByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const reservations = await Reservation.find({ clientId }).sort({
      createdAt: -1,
    });
    return res.json(reservations);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.getByPro = async (req, res) => {
  try {
    const { proId } = req.params;
    const reservations = await Reservation.find({ proId }).sort({
      date: 1,
      time: 1,
    });
    return res.json(reservations);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "accepted", "rejected", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
