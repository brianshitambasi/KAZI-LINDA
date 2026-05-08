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
  markNotificationsRead,
  getFollowers,
  getFollowing,
  checkFollowing,
  getUserPosts
} = require('../controllers/socialController');

router.get('/feed', protect, getFeed);
router.get('/friends', protect, getFriends);
router.get('/online-friends', protect, getOnlineFriends);
router.get('/suggestions', protect, getSuggestions);
router.get('/notifications', protect, getNotifications);
router.get('/notifications/unread', protect, getUnreadNotificationCount);
router.put('/notifications/read', protect, markNotificationsRead);
router.get('/user-posts/:userId', protect, getUserPosts);
router.get('/followers/:userId', protect, getFollowers);
router.get('/following/:userId', protect, getFollowing);
router.get('/following/check/:userId', protect, checkFollowing);
router.post('/posts', protect, createPost);
router.post('/posts/:postId/like', protect, toggleLike);
router.post('/posts/:postId/comment', protect, addComment);
router.post('/follow', protect, followUser);
router.post('/online', protect, updateOnlineStatus);
router.delete('/follow/:userId', protect, unfollowUser);

module.exports = router;
// Post CRUD operations
router.put('/posts/:postId', protect, updatePost);
router.delete('/posts/:postId', protect, deletePost);
