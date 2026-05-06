const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
  getUnreadCount
} = require('../controllers/messageController');

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/unread/count', protect, getUnreadCount);
router.get('/:userId', protect, getMessages);
router.put('/:messageId/read', protect, markAsRead);
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
