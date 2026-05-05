const Employer = require('../models/Employer');
const Blacklist = require('../models/Blacklist');

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
    
    // Add review
    employer.reviews.push({
      userId: req.user.id,
      rating,
      comment,
      date: new Date()
    });
    
    // Calculate new average rating
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

module.exports = {
  verifyEmployer,
  getEmployer,
  rateEmployer,
  reportEmployer,
  getBlacklist,
  createEmployerProfile
};
