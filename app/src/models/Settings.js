const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
  entity_type: {
    type: String,
    required: true,
    enum: ['association', 'districts', 'block', 'municipality', 'designation']
  },
  value: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const SettingsModel = mongoose.model('Settings', SettingsSchema);

module.exports = SettingsModel;
