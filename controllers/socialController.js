// Update the createPost function
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
    
    // Populate author with profile picture
    await post.populate('author', 'name profilePicture role currentStatus');
    
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update getFeed to ensure profile pictures are included
const getFeed = async (req, res) => {
  try {
    const following = await Connection.find({ follower: req.user.id }).distinct('following');
    const posts = await Post.find({
      $or: [
        { author: { $in: [...following, req.user.id] } },
        { privacy: 'public' }
      ]
    })
    .populate('author', 'name profilePicture role currentStatus')
    .populate('comments.user', 'name profilePicture')
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
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
  markNotificationsRead
};
