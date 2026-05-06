const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'accepted' },
  createdAt: { type: Date, default: Date.now }
});

connectionSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
