const express = require('express');
const router = express.Router();
const { triggerEmergency, getEmergencies, resolveEmergency, checkIn } = require('../controllers/emergencyController');
const { protect } = require('../middleware/auth');

router.post('/trigger', protect, triggerEmergency);
router.get('/', protect, getEmergencies);
router.put('/:id/resolve', protect, resolveEmergency);
router.post('/check-in', protect, checkIn);

module.exports = router;
