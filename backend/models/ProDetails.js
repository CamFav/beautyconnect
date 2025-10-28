const mongoose = require("mongoose");

const SlotSchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const AvailabilitySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    slots: { type: [SlotSchema], default: [] }, // [{ start, end }]
  },
  { _id: false }
);

const ProDetailsSchema = new mongoose.Schema(
  {
    proId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    services: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: Number, required: true },
        description: { type: String },
      },
    ],
    availability: {
      type: [AvailabilitySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProDetails", ProDetailsSchema);
