const express = require('express');
const router = express.Router();
const { protect, workerOnly } = require('../middleware/auth');
const User = require('../models/User');

router.post('/:jobId', protect, workerOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.bookmarkedJobs.includes(req.params.jobId)) {
      return res.status(400).json({ message: 'Already bookmarked' });
    }
    user.bookmarkedJobs.push(req.params.jobId);
    await user.save();
    res.json({ message: 'Job bookmarked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:jobId', protect, workerOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.bookmarkedJobs = user.bookmarkedJobs.filter(id => id.toString() !== req.params.jobId);
    await user.save();
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, workerOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarkedJobs');
    res.json(user.bookmarkedJobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
