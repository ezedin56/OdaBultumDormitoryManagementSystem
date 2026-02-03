const express = require('express');
const router = express.Router();
const { createDatabaseBackup, getBackupStats } = require('../controllers/backupController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.get('/database', protect, createDatabaseBackup);
router.get('/stats', protect, getBackupStats);

module.exports = router;
