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

  services: {
    type: [String],
    default: []
  },


  status: {
    type: String,
    enum: ['salon', 'freelance'],
    default: 'freelance'
  },

  // domicile / extérieur / les deux
  exerciseType: {
    type: [String],
    default: []
  },

  experience: {
  type: String,
  enum: ["<1 an", "1 an", "2+ ans", "5+ ans"],
  required: true
    }
}, {
  timestamps: true
});

const Pro = BaseUser.discriminator('pro', ProSchema);
module.exports = Pro;
