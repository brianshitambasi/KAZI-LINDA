const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// Apply for a job (workers only)
const createApplication = async (req, res) => {
  try {
    if (req.user.role !== 'worker' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only workers can apply for jobs' });
    }
    
    const { jobId } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    const existing = await Application.findOne({ jobId, workerId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    const application = await Application.create({
      jobId,
      workerId: req.user.id,
      status: 'pending'
    });
    
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get my applications (worker only)
const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'worker' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const applications = await Application.find({ workerId: req.user.id })
      .populate('jobId', 'title country salary salaryCurrency employerId')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all applications (admin only)
const getAllApplications = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }
    
    const applications = await Application.find({})
      .populate('workerId', 'name email phone')
      .populate('jobId', 'title country employerId');
    
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getAllApplications
};
