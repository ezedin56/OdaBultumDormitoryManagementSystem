const asyncHandler = require('express-async-handler');
const SystemSettings = require('../models/SystemSettings');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
    let settings = await SystemSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
        settings = await SystemSettings.create({
            autoAllocate: true,
            emailNotifications: true,
            maintenanceMode: false,
            maxStudentsPerRoom: 4
        });
    }
    
    res.json(settings);
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    const { autoAllocate, emailNotifications, maintenanceMode, maxStudentsPerRoom } = req.body;
    
    let settings = await SystemSettings.findOne();
    
    // If no settings exist, create new
    if (!settings) {
        settings = await SystemSettings.create({
            autoAllocate,
            emailNotifications,
            maintenanceMode,
            maxStudentsPerRoom
        });
    } else {
        // Update existing settings
        if (autoAllocate !== undefined) settings.autoAllocate = autoAllocate;
        if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
        if (maxStudentsPerRoom !== undefined) {
            if (maxStudentsPerRoom < 1 || maxStudentsPerRoom > 8) {
                res.status(400);
                throw new Error('Max students per room must be between 1 and 8');
            }
            settings.maxStudentsPerRoom = maxStudentsPerRoom;
        }
        
        await settings.save();
    }
    
    res.json({
        success: true,
        message: 'System settings updated successfully',
        settings
    });
});

module.exports = { getSettings, updateSettings };
