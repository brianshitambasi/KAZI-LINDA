const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const {
  getProfile,
  getPublicProfile,
  updateProfile,
  addEducation,
  addCertification,
  addLanguage,
  deleteEducation,
  uploadProfilePicture,
  updateCoverPhoto,
  updateLocation,
  getUserStats
} = require('../controllers/profileController');

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/public/:userId', getPublicProfile);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Profile picture and cover
router.post('/profile-picture', uploadProfilePicture);
router.post('/cover-photo', updateCoverPhoto);

// Location
router.put('/location', updateLocation);

// User stats
router.get('/stats', getUserStats);

// Education
router.post('/education', addEducation);
router.delete('/education/:eduId', deleteEducation);

// Certification
router.post('/certification', addCertification);

// Language
router.post('/language', addLanguage);

module.exports = router;
