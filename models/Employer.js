const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String },
  licenseNumber: { type: String },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  complaints: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, complaint: String, status: String, date: Date }],
  reviews: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number, comment: String, date: Date }],
  blacklisted: { type: Boolean, default: false },
  blacklistReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Employer', employerSchema);
