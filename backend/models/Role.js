const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    permissions: [{
        type: String,
        trim: true
    }],
    isSystemRole: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Prevent deletion of system roles
roleSchema.pre('deleteOne', { document: true, query: false }, async function() {
    if (this.isSystemRole) {
        throw new Error('Cannot delete system roles');
    }
    
    // Check if any admins are assigned to this role
    const Admin = mongoose.model('Admin');
    const adminCount = await Admin.countDocuments({ role: this._id });
    
    if (adminCount > 0) {
        throw new Error(`Cannot delete role. ${adminCount} admin(s) are assigned to this role.`);
    }
});

module.exports = mongoose.model('Role', roleSchema);
