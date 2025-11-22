const mongoose = require("mongoose");

// ========================================
// Schéma Réservation
// ========================================
const reservationSchema = new mongoose.Schema(
  {
    // Références aux utilisateurs
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Référence aux professionnels
    proId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Détails de la réservation
    serviceName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"],
      index: true,
    },
    time: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, "time must be HH:mm"],
      index: true,
    },
    location: { type: String, default: null, trim: true },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        "confirmed",
        "completed",
      ],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

reservationSchema.index({ proId: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model("Reservation", reservationSchema);
