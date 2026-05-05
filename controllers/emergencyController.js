const Emergency = require('../models/Emergency');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Trigger emergency alert
// @route   POST /api/emergency/trigger
// @access  Private
const triggerEmergency = async (req, res) => {
  try {
    const { type, description, location, evidence } = req.body;
    
    const emergency = await Emergency.create({
      workerId: req.user.id,
      type,
      description,
      location,
      evidence: evidence || [],
      status: 'active'
    });
    
    // Get user for notifications
    const user = await User.findById(req.user.id);
    
    // Create notifications for embassy and family
    const notifications = [];
    
    if (user.nextOfKin?.phone) {
      notifications.push({
        userId: user._id,
        type: 'emergency',
        title: 'EMERGENCY ALERT',
        message: `Emergency reported. Type: ${type}. Location: ${location?.address || 'Unknown'}`,
        data: { emergencyId: emergency._id }
      });
    }
    
    await Notification.insertMany(notifications);
    
    // Emit socket event for real-time alerts
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency_alert', {
        emergencyId: emergency._id,
        workerName: user.name,
        workerPhone: user.phone,
        type,
        location,
        timestamp: emergency.createdAt
      });
    }
    
    res.status(201).json({ 
      message: 'Emergency alert sent', 
      emergencyId: emergency._id,
      notified: { embassy: true, family: !!user.nextOfKin?.phone }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get emergencies (user's own)
// @route   GET /api/emergency
// @access  Private
const getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ workerId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Resolve emergency
// @route   PUT /api/emergency/:id/resolve
// @access  Private
const resolveEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }
    
    emergency.status = 'resolved';
    emergency.resolvedAt = new Date();
    emergency.resolution = req.body.resolution;
    emergency.resolvedBy = req.user.id;
    
    await emergency.save();
    res.json({ message: 'Emergency resolved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Daily check-in
// @route   POST /api/emergency/check-in
// @access  Private
const checkIn = async (req, res) => {
  try {
    const { status, location } = req.body;
    const CheckIn = require('../models/CheckIn');
    
    await CheckIn.create({
      workerId: req.user.id,
      status: status || 'safe',
      location,
      respondedVia: 'app'
    });
    
    // Update user's last check-in
    await User.findByIdAndUpdate(req.user.id, {
      lastCheckIn: new Date(),
      currentStatus: status === 'distressed' ? 'distress' : 'working'
    });
    
    res.json({ message: 'Check-in recorded', status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  triggerEmergency,
  getEmergencies,
  resolveEmergency,
  checkIn
};
