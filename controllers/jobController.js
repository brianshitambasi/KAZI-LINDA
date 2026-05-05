const Job = require('../models/Job');
const Employer = require('../models/Employer');
const User = require('../models/User');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const { country, page = 1, limit = 20 } = req.query;
    let filter = { isActive: true };
    
    if (country) filter.country = country;
    
    const jobs = await Job.find(filter)
      .populate('employerId', 'name companyName rating verified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Job.countDocuments(filter);
    
    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name companyName rating verified');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    job.views += 1;
    await job.save();
    
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private/Employer
const createJob = async (req, res) => {
  try {
    // First, find or create Employer profile for this user
    let employer = await Employer.findOne({ email: req.user.email });
    
    if (!employer) {
      // Create employer profile from user data
      employer = await Employer.create({
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        country: req.body.country || 'Kenya',
        verified: false
      });
    }
    
    const jobData = {
      ...req.body,
      employerId: employer._id
    };
    
    const job = await Job.create(jobData);
    res.status(201).json(job);
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private/Employer or Admin
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user owns this job (via employer profile)
    const employer = await Employer.findOne({ email: req.user.email });
    if (job.employerId.toString() !== employer?._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    Object.assign(job, req.body);
    await job.save();
    
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private/Employer or Admin
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const employer = await Employer.findOne({ email: req.user.email });
    if (job.employerId.toString() !== employer?._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get jobs by country
// @route   GET /api/jobs/country/:country
// @access  Public
const getJobsByCountry = async (req, res) => {
  try {
    const jobs = await Job.find({ country: req.params.country, isActive: true })
      .populate('employerId', 'name rating');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Search jobs
// @route   GET /api/jobs/search
// @access  Public
const searchJobs = async (req, res) => {
  try {
    const { q, country } = req.query;
    let filter = { isActive: true };
    
    if (q) {
      filter.$text = { $search: q };
    }
    if (country) filter.country = country;
    
    const jobs = await Job.find(filter)
      .populate('employerId', 'name companyName rating')
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getJobs,
  getJobById,
  searchJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobsByCountry
};
