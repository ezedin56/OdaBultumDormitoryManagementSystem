const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    success: {
        type: Boolean,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    },
    browser: {
        type: String
    },
    os: {
        type: String
    },
    device: {
        type: String
    },
    location: {
        country: String,
        city: String
    },
    failureReason: {
        type: String
    },
    suspicious: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
loginHistorySchema.index({ admin: 1, createdAt: -1 });
loginHistorySchema.index({ success: 1, createdAt: -1 });
loginHistorySchema.index({ suspicious: 1, createdAt: -1 });
loginHistorySchema.index({ ipAddress: 1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
