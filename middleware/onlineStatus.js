const User = require('../models/User');

const trackOnlineStatus = async (req, res, next) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { 
      isOnline: true,
      lastSeen: new Date()
    });
  }
  next();
};

const updateOfflineStatus = async (req, res, next) => {
  if (req.user) {
    // Will be called when user disconnects
    await User.findByIdAndUpdate(req.user.id, { isOnline: false });
  }
  next();
};

module.exports = { trackOnlineStatus, updateOfflineStatus };
