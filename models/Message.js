const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  subject: { type: String },
  message: { type: String, required: true },
  attachments: [{ type: String }],
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  isDeletedForSender: { type: Boolean, default: false },
  isDeletedForReceiver: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
