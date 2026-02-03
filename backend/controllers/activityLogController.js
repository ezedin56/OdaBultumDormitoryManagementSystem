const ActivityLog = require('../models/ActivityLog');
const LoginHistory = require('../models/LoginHistory');

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private (logs.view_activity)
exports.getActivityLogs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            actionType = '', 
            performedBy = '',
            targetAdmin = '',
            startDate = '',
            endDate = ''
        } = req.query;
        
        // Build query
        const query = {};
        
        if (actionType) {
            query.actionType = actionType;
        }
        
        if (performedBy) {
            query.performedBy = performedBy;
        }
        
        if (targetAdmin) {
            query.targetAdmin = targetAdmin;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        // Execute query
        const logs = await ActivityLog.find(query)
            .populate('performedBy', 'fullName email')
            .populate('targetAdmin', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await ActivityLog.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get activity logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activity logs'
        });
    }
};

// @desc    Get login history
// @route   GET /api/admin/login-history
// @access  Private (logs.view_login)
exports.getLoginHistory = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            admin = '',
            success = '',
            suspicious = '',
            startDate = '',
            endDate = ''
        } = req.query;
        
        // Build query
        const query = {};
        
        if (admin) {
            query.admin = admin;
        }
        
        if (success !== '') {
            query.success = success === 'true';
        }
        
        if (suspicious !== '') {
            query.suspicious = suspicious === 'true';
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        // Execute query
        const history = await LoginHistory.find(query)
            .populate('admin', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await LoginHistory.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: history,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get login history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching login history'
        });
    }
};

// @desc    Get admin's login history
// @route   GET /api/admin/login-history/:adminId
// @access  Private (logs.view_login)
exports.getAdminLoginHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const history = await LoginHistory.find({ admin: req.params.adminId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await LoginHistory.countDocuments({ admin: req.params.adminId });
        
        res.status(200).json({
            success: true,
            data: history,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get admin login history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching login history'
        });
    }
};

module.exports = exports;
