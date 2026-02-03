const express = require('express');
const router = express.Router();
const { clearCache, getCacheStats } = require('../controllers/cacheController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.post('/clear', protect, clearCache);
router.get('/stats', protect, getCacheStats);

module.exports = router;
