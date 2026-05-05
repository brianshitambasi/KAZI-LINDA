const express = require('express');
const router = express.Router();
const { applyForJob, getMyApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, employerOnly } = require('../middleware/auth');

router.post('/', protect, applyForJob);
router.get('/my', protect, getMyApplications);
router.put('/:id/status', protect, employerOnly, updateApplicationStatus);

module.exports = router;
