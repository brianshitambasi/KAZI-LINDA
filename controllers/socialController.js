// Follow user - FIXED with proper error handling
const followUser = async (req, res) => {
  try {
    const { followingId } = req.body;
    
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
    const connection = await Connection.create({
      follower: req.user.id,
      following: followingId,
      status: 'pending'  // Add pending status for follow requests
    });
    
    // Create notification for the user being followed
    await Notification.create({
      user: followingId,
      type: 'follow',
      from: req.user.id,
      message: `${req.user.name} wants to follow you`,
      read: false
    });
    
    res.status(201).json({ 
      message: 'Follow request sent', 
      success: true,
      connection 
    });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Accept follow request
const acceptFollow = async (req, res) => {
  try {
    const { connectionId } = req.params;
    
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: 'Follow request not found' });
    }
    
    if (connection.following.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    connection.status = 'accepted';
    await connection.save();
    
    // Add to followers/following arrays
    await User.findByIdAndUpdate(connection.follower, {
      $addToSet: { following: connection.following }
    });
    
    await User.findByIdAndUpdate(connection.following, {
      $addToSet: { followers: connection.follower }
    });
    
    res.json({ message: 'Follow request accepted', success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject follow request
const rejectFollow = async (req, res) => {
  try {
    const { connectionId } = req.params;
    
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: 'Follow request not found' });
    }
    
    if (connection.following.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await connection.deleteOne();
    res.json({ message: 'Follow request rejected', success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pending follow requests
const getPendingFollowRequests = async (req, res) => {
  try {
    const pendingRequests = await Connection.find({
      following: req.user.id,
      status: 'pending'
    }).populate('follower', 'name profilePicture role');
    
    res.json(pendingRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
