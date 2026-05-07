const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
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
} = require('../controllers/socialController');

// Make sure all these functions exist in socialController
router.get('/feed', protect, getFeed);
router.get('/friends', protect, getFriends);
router.get('/online-friends', protect, getOnlineFriends);
router.get('/suggestions', protect, getSuggestions);
router.get('/notifications', protect, getNotifications);
router.get('/notifications/unread', protect, getUnreadNotificationCount);
router.put('/notifications/read', protect, markNotificationsRead);
router.post('/posts', protect, createPost);
router.post('/posts/:postId/like', protect, toggleLike);
router.post('/posts/:postId/comment', protect, addComment);
router.post('/follow', protect, followUser);
router.post('/online', protect, updateOnlineStatus);
router.delete('/follow/:userId', protect, unfollowUser);

module.exports = router;
