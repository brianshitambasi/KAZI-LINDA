const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  unreadCount: { type: Map, of: Number, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
