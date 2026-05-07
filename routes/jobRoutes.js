const express = require('express');
const router = express.Router();
const { protect, employerOnly, adminOnly } = require('../middleware/auth');
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getMyJobApplications,
  updateApplicationStatus
} = require('../controllers/jobController');

// Public routes (anyone can view)
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes - Employers only
router.post('/', protect, employerOnly, createJob);
router.put('/:id', protect, employerOnly, updateJob);
router.delete('/:id', protect, employerOnly, deleteJob);
router.get('/my-jobs', protect, employerOnly, getMyJobs);
router.get('/my-applications', protect, employerOnly, getMyJobApplications);
router.put('/applications/:id/status', protect, employerOnly, updateApplicationStatus);

module.exports = router;
