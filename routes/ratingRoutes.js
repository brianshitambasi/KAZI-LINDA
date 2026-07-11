const express = require('express');
const router = express.Router();
const { protect, workerOnly } = require('../middleware/auth');
const Employer = require('../models/Employer');
const Application = require('../models/Application');

router.post('/employer/:employerId', protect, workerOnly, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const employer = await Employer.findById(req.params.employerId);
    if (!employer) return res.status(404).json({ message: 'Employer not found' });
    
    const hasWorked = await Application.findOne({
      workerId: req.user.id,
      employerId: req.params.employerId,
      status: 'accepted'
    });
    
    if (!hasWorked) {
      return res.status(403).json({ message: 'You can only rate employers you have worked for' });
    }
    
    employer.reviews.push({ workerId: req.user.id, rating, comment, date: new Date() });
    employer.totalRatings = employer.reviews.length;
    const avg = employer.reviews.reduce((sum, r) => sum + r.rating, 0) / employer.reviews.length;
    employer.rating = Math.round(avg * 10) / 10;
    
    await employer.save();
    res.json({ message: 'Rating submitted', rating: employer.rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/employer/:employerId', async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.employerId).select('rating totalRatings reviews');
    if (!employer) return res.status(404).json({ message: 'Employer not found' });
    res.json({ rating: employer.rating, totalRatings: employer.totalRatings, reviews: employer.reviews.slice(-5) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
