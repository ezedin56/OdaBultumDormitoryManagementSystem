const asyncHandler = require('express-async-handler');
const SystemSettings = require('../models/SystemSettings');

// Middleware to check if system is in maintenance mode
const checkMaintenanceMode = asyncHandler(async (req, res, next) => {
    // Get system settings
    const settings = await SystemSettings.findOne();
    
    // If no settings or maintenance mode is off, allow access
    if (!settings || !settings.maintenanceMode) {
        return next();
    }
    
    // If maintenance mode is on, check if user is admin
    if (req.user && req.user.role === 'admin') {
        // Admins can access during maintenance
        return next();
    }
    
    // Block non-admin users
    res.status(503);
    throw new Error('System is currently under maintenance. Please try again later.');
});

module.exports = { checkMaintenanceMode };
