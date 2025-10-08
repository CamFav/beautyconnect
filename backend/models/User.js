const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },

    phone: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },

    // Rôle actif actuel (pour le front)
    activeRole: {
      type: String,
      enum: ['client', 'pro'],
      default: 'client',
    },

    // Infos PRO stockées dans un sous-objet
    proProfile: {
      businessName: { type: String, default: '', trim: true },
      siret: { type: String, default: '', trim: true },
      services: { type: [String], default: [] },
      status: { type: String, enum: ['salon', 'freelance'], default: 'freelance' },
      exerciseType: { type: [String], default: [] },
      experience: {
        type: String,
        enum: ["<1 an", "1 an", "2+ ans", "5+ ans"],
        default: "<1 an",
      },
      location: { type: String, default: '', trim: true },
    },
  },
  {
    timestamps: true,
  }
);

// Hash du mot de passe avant sauvegarde
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer le mot de passe
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
