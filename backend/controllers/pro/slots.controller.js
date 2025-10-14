const Reservation = require("../../models/Reservation");
const ProDetails = require("../../models/ProDetails");

exports.getAvailableSlots = async (req, res) => {
  try {
    const { proId } = req.params;
    const { date, duration } = req.query;

    if (!date) {
      return res.status(400).json({ error: "date (YYYY-MM-DD) is required" });
    }
    if (!duration) {
      return res.status(400).json({ error: "duration (minutes) is required" });
    }

    const details = await ProDetails.findOne({ proId });
    if (!details || !details.availability.length) {
      return res.json([]);
    }

    const dayName = new Date(date)
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase();

    const dayAvailabilities = details.availability.filter(
      (item) => item.dayOfWeek.toLowerCase() === dayName
    );

    if (!dayAvailabilities.length) {
      return res.json([]);
    }

    const serviceDuration = parseInt(duration, 10);
    const slots = [];

    dayAvailabilities.forEach((range) => {
      const { start, end } = range;
      let current = new Date(`${date}T${start}:00`);
      const endTime = new Date(`${date}T${end}:00`);

      while (current < endTime) {
        const next = new Date(current.getTime() + serviceDuration * 60000);
        if (next <= endTime) {
          const h = current.getHours().toString().padStart(2, "0");
          const m = current.getMinutes().toString().padStart(2, "0");
          slots.push(`${h}:${m}`);
        }
        current = next;
      }
    });

    const existing = await Reservation.find({ proId, date });
    const takenSlots = existing.map((r) => r.time);
    const availableSlots = slots.filter((s) => !takenSlots.includes(s));

    return res.json(availableSlots);
  } catch (err) {
    console.error("Erreur getAvailableSlots:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
