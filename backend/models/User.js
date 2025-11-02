const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_WORK_FACTOR = 10;

// Sub-schema for professional profile (optional on User)
const ProProfileSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "", trim: true },
    siret: { type: String, default: "", trim: true },
    status: { type: String, enum: ["salon", "freelance"], default: "freelance" },
    exerciseType: { type: [String], default: [] },
    experience: { type: String, enum: ["<1 an", "1 an", "2+ ans", "5+ ans"], default: "<1 an" },
    headerImage: { type: String, default: "" },
    location: {
      city: { type: String, default: "", trim: true },
      country: { type: String, default: "", trim: true },
      address: { type: String, default: "", trim: true },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    categories: { type: [String], default: [] },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    password: { type: String, required: true, select: false },

    phone: {
      type: String,
      default: "",
      trim: true,
      match: [/^\+?\d{6,15}$/, "Numero de telephone invalide"],
    },

    location: {
      city: { type: String, default: "", trim: true },
      country: { type: String, default: "", trim: true },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },

    avatarClient: { type: String, default: "" },
    avatarPro: { type: String, default: "" },

    role: { type: String, enum: ["client", "pro"], default: "client" },
    activeRole: { type: String, enum: ["client", "pro"], default: "client" },

    // Optional professional profile. Will be created only for pros or when upgrading.
    proProfile: { type: ProProfileSchema, default: undefined },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== "production",
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// Indexation utile pour recherches
UserSchema.index({ "proProfile.location.city": 1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.model("User", UserSchema);
