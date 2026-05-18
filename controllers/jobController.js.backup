const Job = require('../models/Job');
const Application = require('../models/Application');

// Get all jobs (public - anyone can view)
const getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, country } = req.query;
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (country) query.country = country;
    
    const jobs = await Job.find(query)
      .populate('employerId', 'name email companyName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs: jobs || [],
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get all jobs error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get single job (public)
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name email companyName rating');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error('Get job by ID error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create job (employers and admin only)
const createJob = async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only employers can post jobs' });
    }
    
    const jobData = {
      ...req.body,
      employerId: req.user.id,
      isVerified: req.user.role === 'admin'
    };
    
    const job = await Job.create(jobData);
    await job.populate('employerId', 'name email companyName');
    res.status(201).json(job);
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update job (employer who created it or admin)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own jobs' });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete job (employer who created it or admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own jobs' });
    }
    
    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get jobs posted by me (employer only)
const getMyJobs = async (req, res) => {
  try {
    console.log('[getMyJobs] User ID:', req.user.id);
    console.log('[getMyJobs] User Role:', req.user.role);
    
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const jobs = await Job.find({ employerId: req.user.id })
      .populate('employerId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('[getMyJobs] Found jobs:', jobs.length);
    res.json(jobs || []);
  } catch (err) {
    console.error('[getMyJobs] Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get applications for my jobs (employer only)
const getMyJobApplications = async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const jobs = await Job.find({ employerId: req.user.id });
    const jobIds = jobs.map(job => job._id);
    
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('workerId', 'name email profilePicture skills experience')
      .populate('jobId', 'title country salary');
    
    res.json(applications || []);
  } catch (err) {
    console.error('Get my job applications error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update application status (employer only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const application = await Application.findById(req.params.id).populate('jobId');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const job = await Job.findById(application.jobId);
    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    application.status = status;
    if (feedback) application.feedback = feedback;
    await application.save();
    
    res.json(application);
  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Export all functions
module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getMyJobApplications,
  updateApplicationStatus
};
