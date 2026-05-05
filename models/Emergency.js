const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['distress', 'medical', 'legal', 'abuse', 'other'], required: true },
  description: { type: String, required: true },
  location: { lat: Number, lng: Number, address: String, country: String },
  evidence: [{ type: String }],
  status: { type: String, enum: ['active', 'resolved', 'escalated'], default: 'active' },
  notified: { embassy: Boolean, family: Boolean, police: Boolean },
  resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);
