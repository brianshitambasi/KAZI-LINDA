const express = require('express');
const router = express.Router();
const { protect, workerOnly, adminOnly } = require('../middleware/auth');
const {
  createApplication,
  getMyApplications,
  getAllApplications
} = require('../controllers/applicationController');

// Workers only
router.post('/', protect, workerOnly, createApplication);
router.post("/quick-apply/:jobId", protect, workerOnly, quickApply);
router.get('/my-applications', protect, workerOnly, getMyApplications);

// Admin only
router.get('/all', protect, adminOnly, getAllApplications);

module.exports = router;
