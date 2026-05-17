const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, idNumber, county, nextOfKin } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    // Create user - let the schema pre-save middleware handle password hashing
    const user = await User.create({
      name,
      email,
      phone,
      password, // Don't hash here - the schema middleware will hash it
      role: role || 'worker',
      idNumber,
      county,
      nextOfKin
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.idNumber = req.body.idNumber || user.idNumber;
    user.county = req.body.county || user.county;
    user.nextOfKin = req.body.nextOfKin || user.nextOfKin;
    user.skills = req.body.skills || user.skills;
    user.experience = req.body.experience || user.experience;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user status (check-in)
// @route   POST /api/auth/checkin
// @access  Private
const updateCheckIn = async (req, res) => {
  try {
    const { status, location } = req.body;
    const user = await User.findById(req.user.id);
    
    user.currentStatus = status;
    user.lastCheckIn = new Date();
    if (location) {
      user.currentLocation = location;
    }
    
    await user.save();
    res.json({ message: 'Check-in recorded', status: user.currentStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updateCheckIn
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updateCheckIn
};
