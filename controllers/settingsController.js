const User = require('../models/User');

// Get user settings
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    res.json(user.settings || {
      theme: 'light',
      fontSize: 'medium',
      compactView: false,
      highContrast: false,
      notifications: {
        email: true,
        push: true,
        jobAlerts: true,
        messageAlerts: true,
        emergencyAlerts: true,
        friendRequestAlerts: true,
        soundEnabled: true,
        soundVolume: 70,
        soundType: 'modern'
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        showLocation: true,
        allowTagging: true
      },
      language: 'en',
      sessionTimeout: 30
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user settings
const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { settings },
      { new: true }
    ).select('settings');
    res.json({ success: true, settings: user.settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSettings, updateSettings };
