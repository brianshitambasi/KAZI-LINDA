// Follow user - FIXED
const followUser = async (req, res) => {
  try {
    const { followingId } = req.body;
    
    console.log('Follow request:', { follower: req.user.id, following: followingId });
    
    if (!followingId) {
      return res.status(400).json({ message: 'Following ID is required' });
    }
    
    if (followingId === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    // Check if user exists
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already following
    const existing = await Connection.findOne({
      follower: req.user.id,
      following: followingId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    // Create follow relationship
    await Connection.create({
      follower: req.user.id,
      following: followingId
    });
    
    // Also add to following array in User model for quick access
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { following: followingId }
    });
    
    await User.findByIdAndUpdate(followingId, {
      $addToSet: { followers: req.user.id }
    });
    
    console.log('Follow successful');
    res.json({ message: 'Now following', success: true });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Unfollow user - FIXED
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Connection.findOneAndDelete({
      follower: req.user.id,
      following: userId
    });
    
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: req.user.id }
    });
    
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error('Unfollow error:', err);
    res.status(500).json({ message: err.message });
  }
};
