const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email/Username is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Allow either email format or simple username (alphanumeric, underscore, hyphen)
                return /^\S+@\S+\.\S+$/.test(v) || /^[a-zA-Z0-9_-]+$/.test(v);
            },
            message: 'Please provide a valid email or username'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false
    },
    phone: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    customPermissions: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['Active', 'Suspended', 'Deactivated'],
        default: 'Active'
    },
    lastLogin: {
        type: Date
    },
    lastLoginIP: {
        type: String
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    accountLockedUntil: {
        type: Date
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now() - 1000;
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after JWT was issued
adminSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Check if account is locked
adminSchema.methods.isAccountLocked = function() {
    return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

// Increment failed login attempts
adminSchema.methods.incrementLoginAttempts = async function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
        return this.updateOne({
            $set: { failedLoginAttempts: 1 },
            $unset: { accountLockedUntil: 1 }
        });
    }
    
    // Otherwise increment
    const updates = { $inc: { failedLoginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.failedLoginAttempts + 1 >= 5) {
        updates.$set = { accountLockedUntil: Date.now() + 2 * 60 * 60 * 1000 };
    }
    
    return this.updateOne(updates);
};

// Reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $set: { failedLoginAttempts: 0 },
        $unset: { accountLockedUntil: 1 }
    });
};

module.exports = mongoose.model('Admin', adminSchema);
