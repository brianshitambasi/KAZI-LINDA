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
