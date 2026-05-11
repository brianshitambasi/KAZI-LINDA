const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Employer = require('../models/Employer');

// ============= HELPER FUNCTIONS =============

// Get employer profile (for the logged-in employer)
const getEmployerProfile = async (req, res) => {
  try {
    console.log('[getEmployerProfile] Called for user:', req.user.email);
    let employer = await Employer.findOne({ email: req.user.email });
    
    if (!employer) {
      employer = new Employer({
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        country: '',
        isActive: true
      });
      await employer.save();
      console.log('[getEmployerProfile] Created new profile');
    }
    
    res.json(employer);
  } catch (err) {
    console.error('Get employer profile error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update employer profile
const updateEmployerProfile = async (req, res) => {
  try {
    console.log('[updateEmployerProfile] Called for user:', req.user.email);
    const updateData = req.body;
    updateData.updatedAt = new Date();
    
    let employer = await Employer.findOneAndUpdate(
      { email: req.user.email },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );
    
    console.log('[updateEmployerProfile] Updated successfully');
    res.json({ success: true, employer });
  } catch (err) {
    console.error('Update employer profile error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Verify employer
const verifyEmployer = async (req, res) => {
  try {
    const { name, licenseNumber, country } = req.body;
    const Blacklist = require('../models/Blacklist');
    
    const blacklisted = await Blacklist.findOne({ 
      employerName: { $regex: name, $options: 'i' },
      isActive: true 
    });
    
    let employer = await Employer.findOne({ 
      $or: [{ name: { $regex: name, $options: 'i' } }, { licenseNumber }] 
    });
    
    if (!employer) {
      employer = { verified: false, rating: 0, complaints: [], reviews: [] };
    }
    
    res.json({
      employer,
      blacklisted: !!blacklisted,
      blacklistReason: blacklisted?.reason,
      verified: employer.verified,
      rating: employer.rating,
      totalRatings: employer.totalRatings,
      complaints: employer.complaints?.length || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get employer by ID
const getEmployer = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    res.json(employer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get blacklist
const getBlacklist = async (req, res) => {
  try {
    const Blacklist = require('../models/Blacklist');
    const blacklist = await Blacklist.find({ isActive: true, status: 'verified' }).sort({ reportedAt: -1 });
    res.json(blacklist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get employer stats
const getEmployerStats = async (req, res) => {
  try {
    const employerId = req.params.id;
    const Job = require('../models/Job');
    const Application = require('../models/Application');
    
    const employer = await Employer.findById(employerId);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    
    const jobs = await Job.find({ employerId: employerId });
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } });
    
    const stats = {
      totalJobsPosted: jobs.length,
      totalApplications: applications.length,
      hiredCount: applications.filter(a => a.status === 'accepted').length,
      successRate: applications.length > 0 
        ? ((applications.filter(a => a.status === 'accepted').length / applications.length) * 100).toFixed(1) 
        : 0,
      averageRating: employer.rating || 0,
      totalRatings: employer.totalRatings || 0
    };
    
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create employer profile
const createEmployerProfile = async (req, res) => {
  try {
    let employer = await Employer.findOne({ email: req.user.email });
    if (employer) {
      return res.status(400).json({ message: 'Employer profile already exists' });
    }
    
    employer = await Employer.create({
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      ...req.body
    });
    
    res.status(201).json(employer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Rate employer
const rateEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;
    const { rating, comment } = req.body;
    
    const employer = await Employer.findById(employerId);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    
    employer.reviews.push({ userId: req.user.id, rating, comment, date: new Date() });
    const totalRating = employer.reviews.reduce((sum, r) => sum + r.rating, 0);
    employer.rating = totalRating / employer.reviews.length;
    employer.totalRatings = employer.reviews.length;
    
    await employer.save();
    res.json({ success: true, rating: employer.rating, totalRatings: employer.totalRatings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Report employer
const reportEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;
    const { complaint } = req.body;
    
    const employer = await Employer.findById(employerId);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    
    employer.complaints.push({ userId: req.user.id, complaint, date: new Date() });
    await employer.save();
    res.json({ message: 'Complaint filed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= ROUTES (ORDER MATTERS!) =============

// Debug middleware
router.use((req, res, next) => {
  console.log('[EMPLOYER ROUTE]', req.method, req.path);
  next();
});

// PUBLIC ROUTES (no auth)
router.post('/verify', verifyEmployer);
router.get('/blacklist', getBlacklist);

// PROTECTED ROUTES - SPECIFIC PATHS (must come before /:id)
router.use(protect);
router.get('/profile', getEmployerProfile);
router.put('/profile', updateEmployerProfile);
router.post('/create-profile', createEmployerProfile);
router.get('/stats/:id', getEmployerStats);

// DYNAMIC ROUTES (must be LAST - catches any unmatched path like /:id)
router.get('/:id', getEmployer);
router.post('/rate/:id', rateEmployer);
router.post('/report/:id', reportEmployer);

module.exports = router;
