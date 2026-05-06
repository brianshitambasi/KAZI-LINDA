const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  attachments: [{
    filename: { type: String },
    url: { type: String },
    fileType: { type: String },
    size: { type: Number }
  }],
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  isDeletedForSender: { type: Boolean, default: false },
  isDeletedForReceiver: { type: Boolean, default: false },
  messageType: { type: String, enum: ['text', 'image', 'file', 'location'], default: 'text' },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Indexes for faster queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
