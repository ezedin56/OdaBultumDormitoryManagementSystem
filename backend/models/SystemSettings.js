const mongoose = require('mongoose');

const systemSettingsSchema = mongoose.Schema({
    autoAllocate: {
        type: Boolean,
        default: true
    },
    emailNotifications: {
        type: Boolean,
        default: true
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    maxStudentsPerRoom: {
        type: Number,
        default: 4,
        min: 1,
        max: 8
    }
}, {
    timestamps: true
});

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
module.exports = SystemSettings;
