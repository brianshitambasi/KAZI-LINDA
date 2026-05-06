const Application = require('../models/Application');
const Job = require('../models/Job');

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, experience } = req.body;
    
    const existing = await Application.findOne({ jobId, workerId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }
    
    const application = await Application.create({
      jobId,
      workerId: req.user.id,
      coverLetter,
      experience
    });
    
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get my applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ workerId: req.user.id })
      .populate('jobId', 'title description country salary salaryCurrency')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (err) {
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
    if (!job || job.employerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    application.status = status;
    await application.save();
    
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  updateApplicationStatus
};
