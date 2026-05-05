const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  employerName: { type: String, required: true },
  country: { type: String, required: true },
  reason: { type: String, required: true },
  category: { type: String, enum: ['wage_theft', 'abuse', 'document_theft', 'fraud'], required: true },
  evidence: [{ type: String }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Blacklist', blacklistSchema);
