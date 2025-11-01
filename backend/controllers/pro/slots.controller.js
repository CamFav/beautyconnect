const Reservation = require("../../models/Reservation");
const ProDetails = require("../../models/ProDetails");

exports.getAvailableSlots = async (req, res) => {
  try {
    const { proId } = req.params;
    const { date, serviceId } = req.query;

    if (!date) {
      return res.status(400).json({ error: "date (YYYY-MM-DD) is required" });
    }
    if (!serviceId) {
      return res.status(400).json({ error: "serviceId is required" });
    }

    // Validation stricte du format de la date
    const parsedDate = new Date(`${date}T00:00:00`);
    if (isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Expected YYYY-MM-DD" });
    }

    // Récupération du pro + services
    const details = await ProDetails.findOne({ proId });
    if (!details) {
      return res.status(404).json({ error: "Pro not found" });
    }

    const service = details.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const serviceDuration = Number(service.duration);
    if (isNaN(serviceDuration) || serviceDuration <= 0) {
      return res.status(400).json({ error: "Invalid service duration" });
    }

    if (!details.availability || !details.availability.length) {
      return res.json({ proId, date, availableSlots: [] });
    }

    // Jour de la semaine cohérent
    const DAYS_EN = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = DAYS_EN[parsedDate.getDay()];

    const dayAvailabilities = details.availability.filter(
      (item) => item.day && item.day.toLowerCase() === dayName
    );

    if (!dayAvailabilities.length) {
      return res.json({ proId, date, availableSlots: [] });
    }

    // Génération des slots
    const slots = [];

    for (const range of dayAvailabilities) {
      if (!range.slots || !range.slots.length) continue;

      for (const slot of range.slots) {
        const { start, end } = slot;

        if (
          typeof start !== "string" ||
          typeof end !== "string" ||
          !/^\d{2}:\d{2}$/.test(start) ||
          !/^\d{2}:\d{2}$/.test(end)
        ) {
          continue; // ignorer slot invalide
        }

        let current = new Date(`${date}T${start}:00`);
        const endTime = new Date(`${date}T${end}:00`);

        if (isNaN(current.getTime()) || isNaN(endTime.getTime())) continue;

        while (current < endTime) {
          const next = new Date(current.getTime() + serviceDuration * 60000);
          if (next <= endTime) {
            const h = String(current.getHours()).padStart(2, "0");
            const m = String(current.getMinutes()).padStart(2, "0");
            slots.push(`${h}:${m}`);
          }
          current = next;
        }
      }
    }

    // Retirer les créneaux déjà pris
    const existing = await Reservation.find({ proId, date });
    const takenSlots = existing.map((r) => r.time);
    const availableSlots = slots.filter((s) => !takenSlots.includes(s));

    return res.json({ proId, date, availableSlots });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Erreur getAvailableSlots:", err);
    }
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
