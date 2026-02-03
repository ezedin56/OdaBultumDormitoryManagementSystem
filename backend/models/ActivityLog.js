const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    targetAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    actionType: {
        type: String,
        required: true,
        enum: [
            'ADMIN_CREATED',
            'ADMIN_UPDATED',
            'ADMIN_DELETED',
            'ADMIN_SUSPENDED',
            'ADMIN_ACTIVATED',
            'ADMIN_DEACTIVATED',
            'ROLE_CHANGED',
            'PERMISSIONS_UPDATED',
            'PASSWORD_RESET',
            'PASSWORD_CHANGED',
            'LOGIN_SUCCESS',
            'LOGIN_FAILED',
            'LOGOUT',
            'ROLE_CREATED',
            'ROLE_UPDATED',
            'ROLE_DELETED',
            'SECURITY_SETTINGS_UPDATED'
        ]
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
activityLogSchema.index({ performedBy: 1, createdAt: -1 });
activityLogSchema.index({ targetAdmin: 1, createdAt: -1 });
activityLogSchema.index({ actionType: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
