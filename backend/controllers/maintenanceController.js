const asyncHandler = require('express-async-handler');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceRequests = asyncHandler(async (req, res) => {
    const requests = await MaintenanceRequest.find({})
        .populate('student')
        .populate('room')
        .populate('assignedTo');
    res.json(requests);
});

// @desc    Create maintenance request
// @route   POST /api/maintenance
// @access  Private/Student
const createMaintenanceRequest = asyncHandler(async (req, res) => {
    const { student, room, issueType, description, priority } = req.body;

    const request = await MaintenanceRequest.create({
        student,
        room,
        issueType,
        description,
        priority: priority || 'Low',
        status: 'Pending'
    });

    if (request) {
        res.status(201).json(request);
    } else {
        res.status(400);
        throw new Error('Invalid request data');
    }
});

// @desc    Update maintenance request
// @route   PUT /api/maintenance/:id
// @access  Private/Admin/Maintenance
const updateMaintenanceRequest = asyncHandler(async (req, res) => {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (request) {
        request.status = req.body.status || request.status;
        request.assignedTo = req.body.assignedTo || request.assignedTo;

        if (req.body.comment) {
            request.updates.push({
                status: req.body.status,
                comment: req.body.comment,
                updatedBy: req.body.updatedBy
            });
        }

        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } else {
        res.status(404);
        throw new Error('Request not found');
    }
});

// @desc    Get maintenance requests assigned to me
// @route   GET /api/maintenance/my-requests
// @access  Private/Maintenance
const getMyRequests = asyncHandler(async (req, res) => {
    // Assuming user ID is passed in the request (from auth middleware)
    const userId = req.query.userId;

    const requests = await MaintenanceRequest.find({ assignedTo: userId })
        .populate('student')
        .populate('room')
        .sort({ createdAt: -1 });

    res.json(requests);
});

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats
// @access  Private/Maintenance
const getMaintenanceStats = asyncHandler(async (req, res) => {
    const userId = req.query.userId;

    const total = await MaintenanceRequest.countDocuments({ assignedTo: userId });
    const pending = await MaintenanceRequest.countDocuments({ assignedTo: userId, status: 'Pending' });
    const inProgress = await MaintenanceRequest.countDocuments({ assignedTo: userId, status: 'In Progress' });
    const completed = await MaintenanceRequest.countDocuments({ assignedTo: userId, status: 'Completed' });

    res.json({
        total,
        pending,
        inProgress,
        completed
    });
});

// @desc    Delete maintenance request
// @route   DELETE /api/maintenance/:id
// @access  Private/Admin
const deleteMaintenanceRequest = asyncHandler(async (req, res) => {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (request) {
        await request.deleteOne();
        res.json({ message: 'Maintenance request removed' });
    } else {
        res.status(404);
        throw new Error('Request not found');
    }
});

module.exports = {
    getMaintenanceRequests,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    getMyRequests,
    getMaintenanceStats,
    deleteMaintenanceRequest,
};
