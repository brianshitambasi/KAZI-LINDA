const express = require('express');
const router = express.Router();
const { protect, workerOnly, adminOnly } = require('../middleware/auth');
const {
  createApplication,
  getMyApplications,
  getAllApplications,
  quickApply
} = require('../controllers/applicationController');

// Workers only
router.post('/', protect, workerOnly, createApplication);
router.get('/my-applications', protect, workerOnly, getMyApplications);
router.post('/quick-apply/:jobId', protect, workerOnly, quickApply);

// Admin only
router.get('/all', protect, adminOnly, getAllApplications);

module.exports = router;
