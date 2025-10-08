const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schéma de base pour les utilisateurs
const BaseUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }
  },
  {
    timestamps: true,
    discriminatorKey: 'role' // discriminator
  }
);

// Hash du mot de passe avant sauvegarde
BaseUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer le mot de passe
BaseUserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// On exporte UNIQUEMENT le modèle de base
const BaseUser = mongoose.model('User', BaseUserSchema);
module.exports = BaseUser;