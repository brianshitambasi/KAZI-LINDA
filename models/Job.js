const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  country: { type: String, required: true },
  city: { type: String },
  salary: { type: Number, required: true },
  salaryCurrency: { type: String, default: 'SAR' },
  salaryPeriod: { type: String, enum: ['monthly', 'weekly', 'hourly'], default: 'monthly' },
  accommodation: { type: String, enum: ['provided', 'allowance', 'none'], default: 'provided' },
  food: { type: String, enum: ['provided', 'allowance', 'none'], default: 'provided' },
  medicalInsurance: { type: Boolean, default: false },
  workingHours: { type: String },
  daysOff: { type: String, default: '1 day/week' },
  contractDuration: { type: Number, required: true },
  benefits: [{ type: String }],
  requirements: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 }
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', country: 'text' });
module.exports = mongoose.model('Job', jobSchema);
