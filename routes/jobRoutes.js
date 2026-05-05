const express = require('express');
const router = express.Router();
const { 
  getJobs, getJobById, searchJobs, createJob, 
  updateJob, deleteJob, getJobsByCountry 
} = require('../controllers/jobController');
const { protect, employerOnly, adminOnly } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/search', searchJobs);
router.get('/country/:country', getJobsByCountry);
router.get('/:id', getJobById);
router.post('/', protect, employerOnly, createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, adminOnly, deleteJob);

module.exports = router;
