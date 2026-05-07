const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getAllJobs,
  getJobById,
  deleteJob,
  verifyJob,
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  getStats,
  sendWarning
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/status', updateUserStatus);

// Job management
router.get('/jobs', getAllJobs);
router.get('/jobs/:id', getJobById);
router.delete('/jobs/:id', deleteJob);
router.put('/jobs/:id/verify', verifyJob);

// Blacklist management
router.get('/blacklist', getBlacklist);
router.post('/blacklist', addToBlacklist);
router.delete('/blacklist/:id', removeFromBlacklist);

// Stats and warnings
router.get('/stats', getStats);
router.post('/send-warning', sendWarning);

module.exports = router;
