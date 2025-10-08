const mongoose = require('mongoose');
const BaseUser = require('./User');

const ClientSchema = new mongoose.Schema({
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  birthDate: { type: Date },
});

module.exports = BaseUser.discriminator('client', ClientSchema);
