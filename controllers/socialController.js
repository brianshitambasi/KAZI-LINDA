// Create post - FIXED for video handling
const createPost = async (req, res) => {
  try {
    const { content, media, privacy, postType, mediaType, mediaSize } = req.body;
    
    console.log('Creating post with data:', { content, media, mediaType, postType });
    
    const postData = {
      author: req.user.id,
      content: content || '',
      media: media || [],
      privacy: privacy || 'public',
      postType: postType || 'status',
      mediaType: mediaType || 'text',
      mediaSize: mediaSize || 0
    };
    
    const post = await Post.create(postData);
    await post.populate('author', 'name profilePicture role');
    
    console.log('Post created successfully:', post._id);
    res.status(201).json(post);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

// Update post - for editing
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, media, mediaType } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }
    
    if (content !== undefined) post.content = content;
    if (media !== undefined) post.media = media;
    if (mediaType !== undefined) post.mediaType = mediaType;
    
    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Make sure all functions are properly exported
// The following functions should already be defined above:
// getFeed, createPost, updatePost, deletePost, toggleLike, addComment,
// followUser, unfollowUser, getFriends, getOnlineFriends, getSuggestions,
// updateOnlineStatus, getUnreadNotificationCount, getNotifications,
// markNotificationsRead, getFollowers, getFollowing, checkFollowing, getUserPosts

// Update post
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, media, mediaType } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }
    
    if (content) post.content = content;
    if (media) post.media = media;
    if (mediaType) post.mediaType = mediaType;
    
    await post.save();
    await post.populate('author', 'name profilePicture');
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
    
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
