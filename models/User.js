const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['worker', 'employer', 'recruiter', 'admin', 'embassy'], default: 'worker' },
  idNumber: { type: String },
  passportNumber: { type: String },
  county: { type: String },
  nextOfKin: { name: String, phone: String, relationship: String },
  skills: [{ type: String }],
  experience: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastCheckIn: { type: Date },
  currentStatus: { type: String, enum: ['looking', 'departed', 'working', 'returned', 'distress'], default: 'looking' },
  currentLocation: { country: String, city: String, lat: Number, lng: Number }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
