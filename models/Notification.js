const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['follow', 'follow_accept', 'job_application', 'application_status', 'message', 'job_alert', 'system'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // Store additional data like userId, jobId, etc.
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Index for fast queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
