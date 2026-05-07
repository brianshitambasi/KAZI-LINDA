const User = require('../models/User');

// Get user profile (own profile)
const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('reviews.userId', 'name profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get public profile by ID
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }
    
    const user = await User.findById(userId)
      .select('-password -email -phone -nextOfKin -twoFactorEnabled')
      .populate('reviews.userId', 'name profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      profilePicture: user.profilePicture || '',
      coverPhoto: user.coverPhoto || '',
      role: user.role,
      bio: user.bio || '',
      countryOfOrigin: user.countryOfOrigin || 'Kenya',
      currentCountry: user.currentCountry || '',
      currentCity: user.currentCity || '',
      currentStatus: user.currentStatus || 'available',
      skills: user.skills || [],
      languages: user.languages || [],
      education: user.education || [],
      certifications: user.certifications || [],
      rating: user.rating || 0,
      totalRatings: user.totalRatings || 0,
      followers: user.followers || [],
      following: user.following || [],
      isOnline: user.isOnline || false,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Get public profile error:', err);
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
      'companyName', 'companyWebsite', 'companyLicense', 'companyAddress', 'coverPhoto'
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
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
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
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.education.push({ degree, institution, year, description });
    await user.save();
    
    res.json({ success: true, education: user.education });
  } catch (err) {
    console.error('Add education error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Add certification
const addCertification = async (req, res) => {
  try {
    const { name, issuer, date, expiryDate } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.certifications.push({ name, issuer, date, expiryDate });
    await user.save();
    
    res.json({ success: true, certifications: user.certifications });
  } catch (err) {
    console.error('Add certification error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Add language
const addLanguage = async (req, res) => {
  try {
    const { name, proficiency } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.languages.push({ name, proficiency });
    await user.save();
    
    res.json({ success: true, languages: user.languages });
  } catch (err) {
    console.error('Add language error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete education
const deleteEducation = async (req, res) => {
  try {
    const { eduId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.education = user.education.filter(edu => edu._id.toString() !== eduId);
    await user.save();
    
    res.json({ success: true, education: user.education });
  } catch (err) {
    console.error('Delete education error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imageUrl },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, profilePicture: user.profilePicture });
  } catch (err) {
    console.error('Upload profile picture error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update location
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
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, location: user.currentLocation });
  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get user stats
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
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
    console.error('Get user stats error:', err);
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
