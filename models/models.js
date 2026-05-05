// models.js - Complete file with all schemas for KAZI LINDA
const mongoose = require('mongoose');

// ------------------- User -------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['worker', 'employer', 'recruiter', 'admin', 'embassy'], 
    default: 'worker' 
  },
  idNumber: { type: String },
  passportNumber: { type: String },
  county: { type: String },
  nextOfKin: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },
  skills: [{ type: String }],
  experience: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  isActive: { type: Boolean, default: true },
  lastCheckIn: { type: Date },
  currentStatus: { 
    type: String, 
    enum: ['looking', 'departed', 'working', 'returned', 'distress'], 
    default: 'looking' 
  },
  currentLocation: {
    country: { type: String },
    city: { type: String },
    lat: { type: Number },
    lng: { type: Number }
  },
  pushToken: { type: String }, // For push notifications
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ------------------- Employer/Recruiter -------------------
const employerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String },
  licenseNumber: { type: String, unique: true, sparse: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  website: { type: String },
  verified: { type: Boolean, default: false },
  verificationDate: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },
  complaints: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    complaint: { type: String, required: true },
    response: { type: String },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
    date: { type: Date, default: Date.now },
    resolvedAt: { type: Date }
  }],
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now }
  }],
  blacklisted: { type: Boolean, default: false },
  blacklistReason: { type: String },
  blacklistedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  blacklistedAt: { type: Date },
  documents: [{
    type: { type: String }, // license, registration, etc.
    url: { type: String },
    verified: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ------------------- Job Posting -------------------
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  country: { type: String, required: true },
  city: { type: String },
  salary: { type: Number, required: true },
  salaryCurrency: { type: String, default: 'SAR' },
  salaryPeriod: { type: String, enum: ['monthly', 'weekly', 'hourly'], default: 'monthly' },
  accommodation: { type: String, enum: ['provided', 'allowance', 'none'], default: 'provided' },
  accommodationDetails: { type: String },
  food: { type: String, enum: ['provided', 'allowance', 'none'], default: 'provided' },
  transport: { type: String, enum: ['provided', 'allowance', 'none'], default: 'none' },
  medicalInsurance: { type: Boolean, default: false },
  workingHours: { type: String },
  daysOff: { type: String, default: '1 day/week' },
  contractDuration: { type: Number, required: true }, // in months
  benefits: [{ type: String }],
  requirements: [{ type: String }],
  preferredSkills: [{ type: String }],
  experienceRequired: { type: String },
  educationRequired: { type: String },
  gender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
  ageRange: {
    min: { type: Number, default: 18 },
    max: { type: Number, default: 50 }
  },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  verificationNotes: { type: String },
  isActive: { type: Boolean, default: true },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  featuredUntil: { type: Date },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for search
jobSchema.index({ title: 'text', description: 'text', country: 'text', city: 'text' });

// ------------------- Job Application -------------------
const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected', 'withdrawn'], 
    default: 'pending' 
  },
  coverLetter: { type: String },
  experience: { type: String },
  qualifications: [{ type: String }],
  expectedSalary: { type: Number },
  availableFrom: { type: Date },
  notes: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  feedback: { type: String },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate applications
applicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

// ------------------- Emergency Alert -------------------
const emergencySchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['distress', 'medical', 'legal', 'abuse', 'document_theft', 'wage_theft', 'assault', 'other'], 
    required: true 
  },
  description: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
    country: { type: String },
    city: { type: String }
  },
  evidence: [{
    type: { type: String }, // 'photo', 'video', 'audio', 'document'
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['active', 'resolved', 'escalated', 'false_alarm'], 
    default: 'active' 
  },
  notified: {
    embassy: { type: Boolean, default: false },
    family: { type: Boolean, default: false },
    police: { type: Boolean, default: false },
    lawyer: { type: Boolean, default: false }
  },
  responses: [{
    responderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responderRole: { type: String }, // 'embassy', 'police', 'lawyer', 'admin'
    message: { type: String },
    action: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  resolution: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ------------------- Daily Check-In -------------------
const checkInSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['safe', 'concerned', 'distressed', 'no_response'], 
    default: 'safe' 
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  notes: { type: String },
  respondedVia: { type: String, enum: ['app', 'sms', 'whatsapp', 'ussd', 'manual'], default: 'app' },
  createdAt: { type: Date, default: Date.now }
});

// ------------------- Blacklist -------------------
const blacklistSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' },
  employerName: { type: String, required: true },
  country: { type: String, required: true },
  reason: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['wage_theft', 'document_confiscation', 'physical_abuse', 'sexual_harassment', 'human_trafficking', 'contract_violation', 'other'], 
    required: true 
  },
  evidence: [{ type: String }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedByName: { type: String },
  reportedAt: { type: Date, default: Date.now },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedByName: { type: String },
  verifiedAt: { type: Date },
  status: { type: String, enum: ['pending', 'verified', 'disputed', 'removed'], default: 'pending' },
  notes: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ------------------- Know Your Rights Content -------------------
const rightsContentSchema = new mongoose.Schema({
  country: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['salary', 'working_hours', 'accommodation', 'leave', 'termination', 'medical', 'harassment', 'documents', 'emergency'], 
    required: true 
  },
  summary: { type: String },
  legalReference: { type: String },
  videoUrl: { type: String },
  audioUrl: { type: String },
  language: { type: String, enum: ['en', 'sw', 'ar'], default: 'en' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ------------------- Resources (Shelters, Legal Aid, Embassies) -------------------
const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['embassy', 'shelter', 'legal_aid', 'medical', 'police', 'hotline'], 
    required: true 
  },
  country: { type: String, required: true },
  city: { type: String },
  address: { type: String },
  phone: { type: String, required: true },
  alternativePhone: { type: String },
  email: { type: String },
  website: { type: String },
  hours: { type: String },
  services: [{ type: String }],
  languages: [{ type: String }],
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  isActive: { type: Boolean, default: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ------------------- Notification -------------------
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['job_alert', 'application_update', 'emergency', 'check_in_reminder', 'system', 'promotion'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Object },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// ------------------- Export All Models -------------------
module.exports = {
  User: mongoose.model('User', userSchema),
  Employer: mongoose.model('Employer', employerSchema),
  Job: mongoose.model('Job', jobSchema),
  Application: mongoose.model('Application', applicationSchema),
  Emergency: mongoose.model('Emergency', emergencySchema),
  CheckIn: mongoose.model('CheckIn', checkInSchema),
  Blacklist: mongoose.model('Blacklist', blacklistSchema),
  RightsContent: mongoose.model('RightsContent', rightsContentSchema),
  Resource: mongoose.model('Resource', resourceSchema),
  Notification: mongoose.model('Notification', notificationSchema)
};