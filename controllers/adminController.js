const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Blacklist = require('../models/Blacklist');
const Message = require('../models/Message');

// ============= USER MANAGEMENT =============

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const user = await User.create({ name, email, phone, password, role });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role, isActive: status === 'active' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: status === 'active' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `User ${status === 'active' ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= JOB MANAGEMENT =============

// Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).populate('employerId', 'name email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employerId', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Also delete all applications for this job
    await Application.deleteMany({ jobId: req.params.id });
    
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify job
const verifyJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job verified successfully', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= BLACKLIST MANAGEMENT =============

// Get all blacklisted employers
const getBlacklist = async (req, res) => {
  try {
    const blacklist = await Blacklist.find({}).sort({ reportedAt: -1 });
    res.json(blacklist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add to blacklist
const addToBlacklist = async (req, res) => {
  try {
    const { employerName, country, reason, category, reportedBy } = req.body;
    
    const existing = await Blacklist.findOne({ employerName, country });
    if (existing) {
      return res.status(400).json({ message: 'Employer already in blacklist' });
    }
    
    const blacklistEntry = await Blacklist.create({
      employerName,
      country,
      reason,
      category,
      reportedBy: reportedBy || req.user.id,
      reportedAt: new Date(),
      status: 'verified'
    });
    
    res.status(201).json(blacklistEntry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove from blacklist
const removeFromBlacklist = async (req, res) => {
  try {
    const blacklistEntry = await Blacklist.findByIdAndDelete(req.params.id);
    if (!blacklistEntry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Removed from blacklist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= STATISTICS =============

// Get admin dashboard stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();
    const blacklisted = await Blacklist.countDocuments();
    const pendingJobs = await Job.countDocuments({ isVerified: false, isActive: true });
    
    // Get recent users
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5).select('name email role createdAt');
    
    // Get recent jobs
    const recentJobs = await Job.find({}).sort({ createdAt: -1 }).limit(5).populate('employerId', 'name');
    
    res.json({
      totalUsers,
      activeUsers,
      totalJobs,
      activeJobs,
      totalApplications,
      blacklisted,
      pendingJobs,
      recentUsers,
      recentJobs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send warning message to user
const sendWarning = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;
    
    const warningMessage = await Message.create({
      senderId: req.user.id,
      receiverId: userId,
      subject: subject || 'Warning from Admin',
      message: `[ADMIN WARNING]: ${message}`,
      isRead: false
    });
    
    res.json({ message: 'Warning sent successfully', warningMessage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getReports,
  updateReportStatus,
  getActivityLog,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getAllJobs,
  getJobById,
  deleteJob,
  verifyJob,
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  getStats,
  sendWarning
};

// ============= REPORTS MANAGEMENT =============

// Get all reports (complaints about employers)
const getReports = async (req, res) => {
  try {
    const Employer = require('../models/Employer');
    const employers = await Employer.find({ 
      complaints: { $exists: true, $ne: [] } 
    }).populate('complaints.userId', 'name email');
    
    const reports = [];
    employers.forEach(employer => {
      if (employer.complaints && employer.complaints.length > 0) {
        employer.complaints.forEach(complaint => {
          reports.push({
            _id: complaint._id,
            employerId: employer._id,
            employerName: employer.name,
            companyName: employer.companyName,
            complaint: complaint.complaint,
            status: complaint.status || 'pending',
            reportedBy: complaint.userId,
            date: complaint.date,
            resolution: complaint.resolution
          });
        });
      }
    });
    
    // Sort by date (newest first)
    reports.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, resolution } = req.body;
    const Employer = require('../models/Employer');
    
    const employer = await Employer.findOne({ 'complaints._id': reportId });
    if (!employer) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const complaint = employer.complaints.id(reportId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    complaint.status = status;
    if (resolution) complaint.resolution = resolution;
    if (status === 'resolved') complaint.resolvedAt = new Date();
    
    await employer.save();
    res.json({ message: 'Report updated successfully', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= ACTIVITY LOG =============

// Get activity log (combine data from multiple sources)
const getActivityLog = async (req, res) => {
  try {
    const { limit = 50, page = 1, type } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    const User = require('../models/User');
    const Job = require('../models/Job');
    const Application = require('../models/Application');
    const Post = require('../models/Post');
    const Message = require('../models/Message');
    
    // Fetch recent activities from different collections
    const [recentUsers, recentJobs, recentApplications, recentPosts, recentMessages] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).limit(100).select('name email role createdAt'),
      Job.find({}).sort({ createdAt: -1 }).limit(100).populate('employerId', 'name'),
      Application.find({}).sort({ appliedAt: -1 }).limit(100).populate('workerId', 'name').populate('jobId', 'title'),
      Post.find({}).sort({ createdAt: -1 }).limit(100).populate('author', 'name'),
      Message.find({}).sort({ createdAt: -1 }).limit(100).populate('senderId', 'name').populate('receiverId', 'name')
    ]);
    
    // Combine into activity log
    const activities = [];
    
    recentUsers.forEach(user => {
      activities.push({
        id: user._id,
        type: 'user_registered',
        description: `New user registered: ${user.name}`,
        user: user.name,
        details: `Role: ${user.role}`,
        timestamp: user.createdAt,
        icon: 'user_plus',
        color: '#45bd62'
      });
    });
    
    recentJobs.forEach(job => {
      activities.push({
        id: job._id,
        type: 'job_posted',
        description: `New job posted: ${job.title}`,
        user: job.employerId?.name || 'Unknown',
        details: `Country: ${job.country} | Salary: ${job.salary}`,
        timestamp: job.createdAt,
        icon: 'briefcase',
        color: '#1877f2'
      });
    });
    
    recentApplications.forEach(app => {
      activities.push({
        id: app._id,
        type: 'job_applied',
        description: `${app.workerId?.name || 'Someone'} applied for a job`,
        user: app.workerId?.name || 'Anonymous',
        details: `Job: ${app.jobId?.title || 'Unknown'}`,
        timestamp: app.appliedAt,
        icon: 'file_alt',
        color: KL_BRAND
      });
    });
    
    recentPosts.forEach(post => {
      activities.push({
        id: post._id,
        type: 'post_created',
        description: `${post.author?.name || 'Someone'} shared a post`,
        user: post.author?.name || 'Anonymous',
        details: post.content?.substring(0, 100) || '',
        timestamp: post.createdAt,
        icon: 'comment',
        color: '#e41e3f'
      });
    });
    
    recentMessages.forEach(msg => {
      activities.push({
        id: msg._id,
        type: 'message_sent',
        description: `Message sent`,
        user: msg.senderId?.name || 'Anonymous',
        details: `To: ${msg.receiverId?.name || 'Unknown'}`,
        timestamp: msg.createdAt,
        icon: 'envelope',
        color: '#7c3aed'
      });
    });
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Filter by type if specified
    let filteredActivities = activities;
    if (type && type !== 'all') {
      filteredActivities = activities.filter(a => a.type === type);
    }
    
    // Paginate
    const paginatedActivities = filteredActivities.slice(skip, skip + parseInt(limit));
    
    res.json({
      activities: paginatedActivities,
      total: filteredActivities.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredActivities.length / parseInt(limit))
    });
  } catch (err) {
    console.error('Activity log error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getReports,
  updateReportStatus,
  getActivityLog,
  // ... existing exports
  getReports,
  updateReportStatus,
  getActivityLog
};
