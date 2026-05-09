const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createStory,
  getStories,
  viewStory,
  reactToStory,
  deleteStory
} = require('../controllers/storyController');

router.post('/', protect, createStory);
router.get('/', protect, getStories);
router.post('/:storyId/view', protect, viewStory);
router.post('/:storyId/react', protect, reactToStory);
router.delete('/:storyId', protect, deleteStory);

module.exports = router;
