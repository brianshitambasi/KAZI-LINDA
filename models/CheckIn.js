const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['safe', 'concerned', 'distressed'], default: 'safe' },
  location: { lat: Number, lng: Number, address: String },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CheckIn', checkInSchema);
