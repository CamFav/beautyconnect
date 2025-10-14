const mongoose = require("mongoose");

const ProDetailsSchema = new mongoose.Schema(
  {
    proId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    availability: {
      type: [
        {
          dayOfWeek: { type: String, required: true }, // ex: "monday"
          start: { type: String, required: true }, // ex: "09:00"
          end: { type: String, required: true }, // ex: "17:00"
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProDetails", ProDetailsSchema);
