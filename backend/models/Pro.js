const mongoose = require('mongoose');
const BaseUser = require('./User');

const ProSchema = new mongoose.Schema({
  businessName: { type: String, required: true, trim: true },
  siret: { type: String, trim: true },
  location: { type: String, trim: true },
  services: [{ type: String, trim: true }],
  description: { type: String, trim: true },
  socialLinks: {
    instagram: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  // ddisponibilité, photos, tarifs, etc.
});

module.exports = BaseUser.discriminator('pro', ProSchema);
