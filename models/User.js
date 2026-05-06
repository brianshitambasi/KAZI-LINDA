const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['worker', 'employer', 'recruiter', 'admin', 'embassy'], default: 'worker' },
  
  // Personal Profile - NEW FIELDS
  profilePicture: { type: String, default: '' },
  birthday: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  countryOfOrigin: { type: String, default: 'Kenya' },
  currentCountry: { type: String, default: '' },
  currentCity: { type: String, default: '' },
  homeTown: { type: String, default: '' },
  bio: { type: String, maxlength: 500, default: '' },
  
  // Identification
  idNumber: { type: String, default: '' },
  passportNumber: { type: String, default: '' },
  county: { type: String, default: '' },
  
  // Emergency Contact - Enhanced
  nextOfKin: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  
  // Professional Info - Enhanced
  skills: [{ type: String }],
  experience: { type: String, default: '' },
  education: [{
    degree: { type: String },
    institution: { type: String },
    year: { type: Number },
    description: { type: String }
  }],
  certifications: [{
    name: { type: String },
    issuer: { type: String },
    date: { type: Date },
    expiryDate: { type: Date }
  }],
  languages: [{
    name: { type: String },
    proficiency: { type: String, enum: ['basic', 'intermediate', 'fluent', 'native'] }
  }],
  
  // Work Preferences - NEW
  preferredCountries: [{ type: String }],
  preferredJobTypes: [{ type: String, enum: ['full-time', 'part-time', 'contract', 'temporary'] }],
  expectedSalary: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'KES' }
  },
  availability: { type: Date, default: Date.now },
  
  // Worker Status
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastCheckIn: { type: Date },
  currentStatus: { 
    type: String, 
    enum: ['looking', 'departed', 'working', 'returned', 'distress', 'available'], 
    default: 'looking' 
  },
  currentLocation: { 
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Employer Specific (if role is employer)
  companyName: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  companyLicense: { type: String, default: '' },
  companyAddress: { type: String, default: '' },
  
  // Ratings & Reviews
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now }
  }],
  
  // Social Links - NEW
  socialLinks: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  
  // Account Settings
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: true },
  twoFactorEnabled: { type: Boolean, default: false },
  
  // Timestamps
  lastLogin: { type: Date },
  lastSeen: { type: Date },
  isOnline: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ currentStatus: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ countryOfOrigin: 1 });
userSchema.index({ currentCountry: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Update lastSeen
userSchema.methods.updateLastSeen = async function() {
  this.lastSeen = new Date();
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
