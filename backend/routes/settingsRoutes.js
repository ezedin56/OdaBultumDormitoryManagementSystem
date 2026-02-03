const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

// Public route to check maintenance mode
router.get('/', getSettings);

// Protected route to update settings
router.put('/', protect, updateSettings);

module.exports = router;
