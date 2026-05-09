const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getFeed,
  createPost,
  updatePost,
  deletePost,
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
  getUserPosts,
  getPendingFollowRequests,
  acceptFollow,
  rejectFollow
} = require('../controllers/socialController');

// Feed and posts
router.get('/feed', protect, getFeed);
router.post('/posts', protect, createPost);
router.put('/posts/:postId', protect, updatePost);
router.delete('/posts/:postId', protect, deletePost);
router.post('/posts/:postId/like', protect, toggleLike);
router.post('/posts/:postId/comment', protect, addComment);

// Follow routes
router.post('/follow', protect, followUser);
router.delete('/follow/:userId', protect, unfollowUser);
router.get('/following/check/:userId', protect, checkFollowing);

// Follow request routes
router.get('/follow-requests', protect, getPendingFollowRequests);
router.post('/follow/:connectionId/accept', protect, acceptFollow);
router.post('/follow/:connectionId/reject', protect, rejectFollow);

// Friends/Connections
router.get('/friends', protect, getFriends);
router.get('/online-friends', protect, getOnlineFriends);
router.get('/suggestions', protect, getSuggestions);

// User posts
router.get('/user-posts/:userId', protect, getUserPosts);

// Follower/Following lists
router.get('/followers/:userId', protect, getFollowers);
router.get('/following/:userId', protect, getFollowing);

// Notifications
router.get('/notifications', protect, getNotifications);
router.get('/notifications/unread', protect, getUnreadNotificationCount);
router.put('/notifications/read', protect, markNotificationsRead);

// Online status
router.post('/online', protect, updateOnlineStatus);

module.exports = router;
