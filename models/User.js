const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['worker', 'employer', 'recruiter', 'admin', 'embassy'], default: 'worker' },
  
  // Profile fields
  profilePicture: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  bio: { type: String, default: '' },
  birthday: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  countryOfOrigin: { type: String, default: 'Kenya' },
  currentCountry: { type: String, default: '' },
  currentCity: { type: String, default: '' },
  homeTown: { type: String, default: '' },
  
  // Professional
  skills: [{ type: String }],
  experience: { type: String, default: '' },
  education: [{
    degree: String,
    institution: String,
    year: Number,
    description: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    expiryDate: Date
  }],
  languages: [{
    name: String,
    proficiency: { type: String, enum: ['basic', 'intermediate', 'fluent', 'native'] }
  }],
  
  // Social
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Status
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  currentStatus: { 
    type: String, 
    enum: ['looking', 'working', 'available', 'busy', 'away'], 
    default: 'available' 
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // Emergency contact
  nextOfKin: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  
  // Timestamps
  lastCheckIn: { type: Date },
  currentLocation: { country: String, city: String, lat: Number, lng: Number }
}, { timestamps: true });

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });

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

// Update last seen
userSchema.methods.updateLastSeen = async function() {
  this.lastSeen = new Date();
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
// Ensure profilePicture field exists and is properly indexed
userSchema.index({ profilePicture: 1 });
