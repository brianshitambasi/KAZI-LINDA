const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  getPublicProfile,
  updateProfile,
  addEducation,
  addCertification,
  addLanguage,
  deleteEducation,
  uploadProfilePicture,
  updateLocation,
  getUserStats
} = require('../controllers/profileController');

// Protected routes (require authentication)
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.get('/stats', protect, getUserStats);
router.post('/location', protect, updateLocation);
router.post('/profile-picture', protect, uploadProfilePicture);

// Education routes
router.post('/education', protect, addEducation);
router.delete('/education/:eduId', protect, deleteEducation);

// Certification routes
router.post('/certification', protect, addCertification);

// Language routes
router.post('/language', protect, addLanguage);

// Public profile route
router.get('/:userId', protect, getPublicProfile);

module.exports = router;
