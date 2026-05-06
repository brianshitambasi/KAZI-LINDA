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
  getSuggestions,
  getNotifications,
  markNotificationsRead
} = require('../controllers/socialController');

router.get('/feed', protect, getFeed);
router.get('/suggestions', protect, getSuggestions);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.post('/posts', protect, createPost);
router.post('/posts/:postId/like', protect, toggleLike);
router.post('/posts/:postId/comment', protect, addComment);
router.post('/follow', protect, followUser);
router.delete('/follow/:userId', protect, unfollowUser);

module.exports = router;
