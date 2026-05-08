const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  media: [{ type: String }],
  mediaType: { type: String, enum: ['text', 'photo', 'video', 'share'], default: 'text' },
  mediaSize: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  originalPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  postType: { type: String, enum: ['status', 'job', 'achievement', 'emergency'], default: 'status' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
