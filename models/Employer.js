const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  companyName: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternativePhone: { type: String },
  
  // Location Information
  address: { type: String },
  city: { type: String },
  country: { type: String, required: true },
  postalCode: { type: String },
  location: {
    lat: Number,
    lng: Number
  },
  
  // Household Information (for domestic workers)
  householdType: { 
    type: String, 
    enum: ['apartment', 'villa', 'house', 'farm', 'other'],
    default: 'house'
  },
  householdSize: { type: Number }, // Number of family members
  numberOfChildren: { type: Number, default: 0 },
  childrenAges: [{ type: String }], // e.g., "2-5", "6-10", "11-15"
  numberOfRooms: { type: Number },
  hasPets: { type: Boolean, default: false },
  pets: [{ type: String }], // e.g., "dog", "cat", "bird", "other"
  hasSpecialNeeds: { type: Boolean, default: false },
  specialNeeds: { type: String },
  
  // Company Information (for business/company employers)
  businessType: { type: String, enum: ['private', 'government', 'ngo', 'individual', 'other'] },
  industry: { type: String },
  companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
  taxId: { type: String },
  licenseNumber: { type: String },
  website: { type: String },
  
  // Work Environment
  workingHours: { type: String, default: '8 hours/day' },
  daysOff: { type: String, default: '1 day/week' },
  overtime: { type: String, default: 'As per labor law' },
  accommodation: { 
    type: String, 
    enum: ['provided', 'allowance', 'shared', 'none'],
    default: 'provided'
  },
  food: { 
    type: String, 
    enum: ['provided', 'allowance', 'none'],
    default: 'provided'
  },
  transportation: { 
    type: String, 
    enum: ['provided', 'allowance', 'none'],
    default: 'none'
  },
  
  // Benefits
  benefits: [{
    type: String,
    enum: ['medical_insurance', 'flight_ticket', 'annual_leave', 'accommodation', 'transport', 'education', 'other']
  }],
  otherBenefits: { type: String },
  
  // Requirements
  educationLevel: { type: String, enum: ['none', 'primary', 'secondary', 'diploma', 'degree', 'masters'] },
  experience: { type: String, enum: ['none', '1_year', '2_5_years', '5_10_years', '10+_years'] },
  languages: [{
    name: String,
    proficiency: { type: String, enum: ['basic', 'intermediate', 'fluent', 'native'] }
  }],
  agePreference: { type: String },
  genderPreference: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
  maritalStatus: { type: String, enum: ['any', 'single', 'married', 'divorced'], default: 'any' },
  
  // Profile Pictures
  profilePicture: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  documents: [{
    type: { type: String },
    url: { type: String },
    verified: { type: Boolean, default: false }
  }],
  
  // Verification & Ratings
  verified: { type: Boolean, default: false },
  verificationDate: { type: Date },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  complaints: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    complaint: String,
    status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' },
    resolution: String,
    date: { type: Date, default: Date.now },
    resolvedAt: Date
  }],
  
  // Status
  isActive: { type: Boolean, default: true },
  isBlacklisted: { type: Boolean, default: false },
  blacklistReason: { type: String },
  
  // Emergency Contact for Employers
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better search
employerSchema.index({ name: 'text', companyName: 'text' });
employerSchema.index({ country: 1 });
employerSchema.index({ isBlacklisted: 1 });
employerSchema.index({ verified: 1 });

module.exports = mongoose.model('Employer', employerSchema);
