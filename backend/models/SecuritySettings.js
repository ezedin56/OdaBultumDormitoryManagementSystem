const mongoose = require('mongoose');

const securitySettingsSchema = new mongoose.Schema({
    passwordPolicy: {
        minLength: {
            type: Number,
            default: 8,
            min: 6,
            max: 32
        },
        requireUppercase: {
            type: Boolean,
            default: true
        },
        requireLowercase: {
            type: Boolean,
            default: true
        },
        requireNumbers: {
            type: Boolean,
            default: true
        },
        requireSpecialChars: {
            type: Boolean,
            default: true
        },
        passwordExpiryDays: {
            type: Number,
            default: 90,
            min: 0
        }
    },
    loginSecurity: {
        maxLoginAttempts: {
            type: Number,
            default: 5,
            min: 3,
            max: 10
        },
        lockoutDurationMinutes: {
            type: Number,
            default: 120,
            min: 5
        },
        sessionTimeoutMinutes: {
            type: Number,
            default: 60,
            min: 5
        },
        require2FA: {
            type: Boolean,
            default: false
        }
    },
    ipRestrictions: {
        enabled: {
            type: Boolean,
            default: false
        },
        allowedIPs: [{
            type: String
        }],
        blockedIPs: [{
            type: String
        }]
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
securitySettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('SecuritySettings', securitySettingsSchema);
