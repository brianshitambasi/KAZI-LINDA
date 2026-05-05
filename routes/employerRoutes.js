const express = require('express');
const router = express.Router();
const { 
  verifyEmployer, 
  getEmployer, 
  rateEmployer, 
  reportEmployer, 
  getBlacklist,
  createEmployerProfile
} = require('../controllers/employerController');
const { protect, employerOnly } = require('../middleware/auth');

router.post('/verify', verifyEmployer);
router.get('/blacklist/all', getBlacklist);
router.get('/:id', getEmployer);
router.post('/:id/rate', protect, rateEmployer);
router.post('/:id/report', protect, reportEmployer);
router.post('/create-profile', protect, employerOnly, createEmployerProfile);

module.exports = router;

// Temporary - check if employer exists
router.get('/check', protect, async (req, res) => {
  const Employer = require('../models/Employer');
  const employer = await Employer.findOne({ email: req.user.email });
  res.json({ exists: !!employer, employer });
});
