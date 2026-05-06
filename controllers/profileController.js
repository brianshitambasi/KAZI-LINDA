const User = require('../models/User');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('reviews.userId', 'name profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get public profile by ID
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select('-password -email -phone -nextOfKin -twoFactorEnabled')
      .populate('reviews.userId', 'name profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'bio', 'birthday', 'gender', 'countryOfOrigin', 'currentCountry', 
      'currentCity', 'homeTown', 'skills', 'experience', 'education', 
      'certifications', 'languages', 'preferredCountries', 'preferredJobTypes', 
      'expectedSalary', 'socialLinks', 'profilePicture', 'currentStatus',
      'companyName', 'companyWebsite', 'companyLicense', 'companyAddress'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Add education
const addEducation = async (req, res) => {
  try {
    const { degree, institution, year, description } = req.body;
    const user = await User.findById(req.user.id);
    
    user.education.push({ degree, institution, year, description });
    await user.save();
    
    res.json({ success: true, education: user.education });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add certification
const addCertification = async (req, res) => {
  try {
    const { name, issuer, date, expiryDate } = req.body;
    const user = await User.findById(req.user.id);
    
    user.certifications.push({ name, issuer, date, expiryDate });
    await user.save();
    
    res.json({ success: true, certifications: user.certifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add language
const addLanguage = async (req, res) => {
  try {
    const { name, proficiency } = req.body;
    const user = await User.findById(req.user.id);
    
    user.languages.push({ name, proficiency });
    await user.save();
    
    res.json({ success: true, languages: user.languages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete education
const deleteEducation = async (req, res) => {
  try {
    const { eduId } = req.params;
    const user = await User.findById(req.user.id);
    
    user.education = user.education.filter(edu => edu._id.toString() !== eduId);
    await user.save();
    
    res.json({ success: true, education: user.education });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imageUrl },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, profilePicture: user.profilePicture });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update location (check-in)
const updateLocation = async (req, res) => {
  try {
    const { country, city, lat, lng } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        currentLocation: { country, city, lat, lng, lastUpdated: new Date() },
        lastCheckIn: new Date()
      },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, location: user.currentLocation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user stats
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const Message = require('../models/Message');
    const Application = require('../models/Application');
    
    const messagesSent = await Message.countDocuments({ senderId: req.user.id });
    const messagesReceived = await Message.countDocuments({ receiverId: req.user.id });
    const applications = await Application.countDocuments({ workerId: req.user.id });
    
    res.json({
      messagesSent,
      messagesReceived,
      applications,
      memberSince: user.createdAt,
      lastActive: user.lastSeen,
      rating: user.rating,
      totalRatings: user.totalRatings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProfile,
  getPublicProfile,
  updateProfile,
  addEducation,
  addCertification,
  addLanguage,
  deleteEducation,
  uploadProfilePicture,
  updateLocation,
  getUserStats
};
