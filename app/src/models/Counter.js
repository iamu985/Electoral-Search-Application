const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const counterSchema = Schema({
    name: { type: String, required: true },
    sequence_value: { type: Number, required: true }
  })

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;