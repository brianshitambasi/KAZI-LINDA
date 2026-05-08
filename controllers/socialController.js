const Post = require('../models/Post');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get feed posts
const getFeed = async (req, res) => {
  try {
    const following = await Connection.find({ follower: req.user.id }).distinct('following');
    const posts = await Post.find({
      $or: [
        { author: { $in: [...following, req.user.id] } },
        { privacy: 'public' }
      ]
    })
    .populate('author', 'name profilePicture role')
    .populate('comments.user', 'name profilePicture')
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create post
const createPost = async (req, res) => {
  try {
    const { content, media, privacy, postType } = req.body;
    const post = await Post.create({
      author: req.user.id,
      content,
      media,
      privacy: privacy || 'public',
      postType: postType || 'status'
    });
    
    await post.populate('author', 'name profilePicture role');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like/Unlike post
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(likeIndex, 1);
    }
    
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.comments.push({
      user: req.user.id,
      text
    });
    await post.save();
    
    res.status(201).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Follow user
const followUser = async (req, res) => {
  try {
    const { followingId } = req.body;
    
    if (followingId === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const existing = await Connection.findOne({
      follower: req.user.id,
      following: followingId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Already following' });
    }
    
    await Connection.create({
      follower: req.user.id,
      following: followingId
    });
    
    res.json({ message: 'Now following' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unfollow user
const unfollowUser = async (req, res) => {
  try {
    await Connection.findOneAndDelete({
      follower: req.user.id,
      following: req.params.userId
    });
    res.json({ message: 'Unfollowed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get friends list
const getFriends = async (req, res) => {
  try {
    const following = await Connection.find({ follower: req.user.id }).distinct('following');
    const friends = await User.find({ _id: { $in: following } })
      .select('name profilePicture role currentCountry currentStatus isOnline lastSeen');
    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get online friends
const getOnlineFriends = async (req, res) => {
  try {
    const following = await Connection.find({ follower: req.user.id }).distinct('following');
    const onlineFriends = await User.find({ 
      _id: { $in: following },
      isOnline: true 
    }).select('name profilePicture role');
    res.json(onlineFriends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get suggestions
const getSuggestions = async (req, res) => {
  try {
    const following = await Connection.find({ follower: req.user.id }).distinct('following');
    
    const suggestions = await User.find({
      _id: { $nin: [...following, req.user.id] },
      role: { $ne: 'admin' }
    })
    .select('name profilePicture role currentCountry currentStatus')
    .limit(10);
    
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update online status
const updateOnlineStatus = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { 
      isOnline: true, 
      lastSeen: new Date() 
    });
    res.json({ message: 'Online status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unread notification count
const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user.id, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('from', 'name profilePicture')
      .populate('postId', 'content')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark notifications read
const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get followers of a user
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const connections = await Connection.find({ following: userId })
      .populate('follower', 'name profilePicture role currentStatus isOnline');
    res.json(connections.map(c => c.follower));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get following of a user
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const connections = await Connection.find({ follower: userId })
      .populate('following', 'name profilePicture role currentStatus isOnline');
    res.json(connections.map(c => c.following));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if following
const checkFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await Connection.findOne({
      follower: req.user.id,
      following: userId
    });
    res.json({ following: !!connection });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's own posts (for profile page)
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ author: userId })
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    console.error('Get user posts error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updatePost,
  deletePost,
  getFeed,
  createPost,
  toggleLike,
  addComment,
  followUser,
  unfollowUser,
  getFriends,
  getOnlineFriends,
  getSuggestions,
  updateOnlineStatus,
  getUnreadNotificationCount,
  getNotifications,
  markNotificationsRead,
  getFollowers,
  getFollowing,
  checkFollowing,
  getUserPosts
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, media, mediaType } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if user owns the post
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }
    
    if (content) post.content = content;
    if (media) post.media = media;
    if (mediaType) post.mediaType = mediaType;
    
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if user owns the post
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
