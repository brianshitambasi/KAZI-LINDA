const Story = require('../models/Story');
const User = require('../models/User');

// Create a story
const createStory = async (req, res) => {
  try {
    const { media, mediaType, caption } = req.body;
    
    const story = await Story.create({
      user: req.user.id,
      media,
      mediaType,
      caption
    });
    
    await story.populate('user', 'name profilePicture');
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all stories (from followed users + public)
const getStories = async (req, res) => {
  try {
    const stories = await Story.find({
      $or: [
        { user: { $in: req.user.following } },
        { user: req.user.id }
      ],
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
    .populate('user', 'name profilePicture role')
    .sort({ createdAt: -1 });
    
    // Group stories by user
    const groupedStories = {};
    stories.forEach(story => {
      const userId = story.user._id.toString();
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          user: story.user,
          stories: []
        };
      }
      groupedStories[userId].stories.push(story);
    });
    
    res.json(Object.values(groupedStories));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// View a story (add view)
const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    
    if (!story) return res.status(404).json({ message: 'Story not found' });
    
    if (!story.views.includes(req.user.id)) {
      story.views.push(req.user.id);
      await story.save();
    }
    
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add reaction to story
const reactToStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { type } = req.body;
    const story = await Story.findById(storyId);
    
    if (!story) return res.status(404).json({ message: 'Story not found' });
    
    const existingReaction = story.reactions.find(r => r.user.toString() === req.user.id);
    if (existingReaction) {
      existingReaction.type = type;
    } else {
      story.reactions.push({ user: req.user.id, type });
    }
    
    await story.save();
    res.json(story.reactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete own story
const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await story.deleteOne();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createStory,
  getStories,
  viewStory,
  reactToStory,
  deleteStory
};
