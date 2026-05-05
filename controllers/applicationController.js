const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private
const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, experience, qualifications, expectedSalary, availableFrom } = req.body;
    
    // Check if already applied
    const existing = await Application.findOne({ jobId, workerId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }
    
    const application = await Application.create({
      jobId,
      workerId: req.user.id,
      coverLetter,
      experience,
      qualifications,
      expectedSalary,
      availableFrom
    });
    
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get my applications
// @route   GET /api/applications/my
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ workerId: req.user.id })
      .populate('jobId', 'title country salary employerId')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update application status (Employer)
// @route   PUT /api/applications/:id/status
// @access  Private/Employer
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const application = await Application.findById(req.params.id).populate('jobId');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    application.status = status;
    application.feedback = feedback;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user.id;
    
    await application.save();
    
    // Create notification for worker
    await Notification.create({
      userId: application.workerId,
      type: 'application_update',
      title: 'Application Update',
      message: `Your application for ${application.jobId.title} has been ${status}`,
      data: { applicationId: application._id, status }
    });
    
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
