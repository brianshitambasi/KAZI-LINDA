const Employer = require('../models/Employer');
const Blacklist = require('../models/Blacklist');
const Job = require('../models/Job');
const Application = require('../models/Application');

const verifyEmployer = async (req, res) => {
  try {
    const { name, licenseNumber, country } = req.body;
    
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

const rateEmployer = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const employer = await Employer.findById(req.params.id);
    
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    
    employer.reviews.push({
      userId: req.user.id,
      rating,
      comment,
      date: new Date()
    });
    
    const total = employer.reviews.reduce((sum, r) => sum + r.rating, 0);
    employer.rating = total / employer.reviews.length;
    employer.totalRatings = employer.reviews.length;
    
    await employer.save();
    
    res.json({ 
      message: 'Rating submitted successfully', 
      rating: employer.rating,
      totalRatings: employer.totalRatings
    });
  } catch (err) {
    console.error('Rate employer error:', err);
    res.status(500).json({ message: err.message });
  }
};

const reportEmployer = async (req, res) => {
  try {
    const { complaint } = req.body;
    const employer = await Employer.findById(req.params.id);
    
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    
    employer.complaints.push({
      userId: req.user.id,
      complaint,
      status: 'pending',
      date: new Date()
    });
    
    await employer.save();
    res.json({ message: 'Complaint filed', complaintId: employer.complaints[employer.complaints.length - 1]._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBlacklist = async (req, res) => {
  try {
    const blacklist = await Blacklist.find({ isActive: true, status: 'verified' })
      .sort({ reportedAt: -1 });
    res.json(blacklist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createEmployerProfile = async (req, res) => {
  try {
    const { companyName, licenseNumber, country, address, website } = req.body;
    
    let employer = await Employer.findOne({ email: req.user.email });
    
    if (employer) {
      return res.status(400).json({ message: 'Employer profile already exists' });
    }
    
    employer = await Employer.create({
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      companyName: companyName || req.user.name,
      licenseNumber,
      country,
      address,
      website
    });
    
    res.status(201).json(employer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get employer detailed stats (for verification)
const getEmployerStats = async (req, res) => {
  try {
    const employerId = req.params.id;
    
    const employer = await Employer.findById(employerId);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    
    const jobs = await Job.find({ employerId: employerId });
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } }).populate('workerId', 'name email phone');
    
    const stats = {
      totalJobsPosted: jobs.length,
      totalApplications: applications.length,
      hiredCount: applications.filter(a => a.status === 'accepted').length,
      rejectedCount: applications.filter(a => a.status === 'rejected').length,
      pendingCount: applications.filter(a => a.status === 'pending').length,
      successRate: applications.length > 0 
        ? ((applications.filter(a => a.status === 'accepted').length / applications.length) * 100).toFixed(1) 
        : 0,
      averageRating: employer.rating || 0,
      totalRatings: employer.totalRatings || 0,
      complaintCount: employer.complaints?.length || 0,
      verified: employer.verified || false,
      memberSince: employer.createdAt
    };
    
    const recentHires = applications
      .filter(a => a.status === 'accepted')
      .slice(0, 5)
      .map(a => ({
        workerName: a.workerId?.name,
        workerPhone: a.workerId?.phone,
        jobTitle: jobs.find(j => j._id.toString() === a.jobId.toString())?.title,
        hiredDate: a.updatedAt
      }));
    
    res.json({
      employer: {
        name: employer.name,
        companyName: employer.companyName,
        country: employer.country,
        phone: employer.phone,
        email: employer.email,
        verified: employer.verified,
        rating: employer.rating,
        totalRatings: employer.totalRatings,
        memberSince: employer.createdAt
      },
      stats,
      recentHires,
      jobs: jobs.map(j => ({
        title: j.title,
        country: j.country,
        salary: j.salary,
        postedDate: j.createdAt,
        applicationsCount: applications.filter(a => a.jobId.toString() === j._id.toString()).length
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  verifyEmployer,
  getEmployer,
  rateEmployer,
  reportEmployer,
  getBlacklist,
  createEmployerProfile,
  getEmployerStats
};
