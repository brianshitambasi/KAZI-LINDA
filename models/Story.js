const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: { type: String, required: true },
  mediaType: { type: String, enum: ['photo', 'video'], required: true },
  caption: { type: String, maxLength: 200 },
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'], default: 'like' }
  }],
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24 hours (86400 seconds)
});

storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Story', storySchema);
