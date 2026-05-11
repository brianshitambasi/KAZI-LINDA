const express = require('express');
const router = express.Router();
const { protect, employerOnly } = require('../middleware/auth');
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

// DEBUG - log all requests
router.use((req, res, next) => {
  console.log('[JOB ROUTE]', req.method, req.path);
  next();
});

// ============= PUBLIC ROUTES =============
router.get('/', getAllJobs);

// ============= PROTECTED ROUTES (specific paths first) =============
router.get('/my-jobs', protect, employerOnly, getMyJobs);
router.get('/my-applications', protect, employerOnly, getMyJobApplications);
router.put('/applications/:id/status', protect, employerOnly, updateApplicationStatus);
router.post('/', protect, employerOnly, createJob);
router.put('/:id', protect, employerOnly, updateJob);
router.delete('/:id', protect, employerOnly, deleteJob);

// ============= DYNAMIC ROUTE (must be LAST) =============
router.get('/:id', getJobById);

module.exports = router;
