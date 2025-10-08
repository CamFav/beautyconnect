const mongoose = require('mongoose');
const BaseUser = require('./User');

const ProSchema = new mongoose.Schema({
  businessName: {
    type: String,
    default: '',
    trim: true
  },
  siret: {
    type: String,
    default: '',
    trim: true
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  services: {
    type: [String],
    default: []
  }
}, { timestamps: true });


// ddisponibilité, photos, tarifs, etc.

// Discriminator
const Pro = BaseUser.discriminator('pro', ProSchema);

module.exports = Pro;
