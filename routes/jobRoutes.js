const express = require('express');
const router = express.Router();
const { 
  getJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob,
  getMyJobs,
  getJobApplications
} = require('../controllers/jobController');
const { protect, employerOnly } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Employer routes (require authentication)
router.post('/', protect, employerOnly, createJob);
router.put('/:id', protect, employerOnly, updateJob);
router.delete('/:id', protect, employerOnly, deleteJob);
router.get('/employer/my', protect, employerOnly, getMyJobs);
router.get('/:id/applications', protect, employerOnly, getJobApplications);

module.exports = router;
