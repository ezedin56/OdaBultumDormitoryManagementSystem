const SecuritySettings = require('../models/SecuritySettings');

// Validate password against security policy
exports.validatePassword = async (password) => {
    const settings = await SecuritySettings.getSettings();
    const policy = settings.passwordPolicy;
    
    const errors = [];
    
    // Check minimum length
    if (password.length < policy.minLength) {
        errors.push(`Password must be at least ${policy.minLength} characters long`);
    }
    
    // Check uppercase
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    // Check lowercase
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    // Check numbers
    if (policy.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    // Check special characters
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

// Get password policy for frontend
exports.getPasswordPolicy = async () => {
    const settings = await SecuritySettings.getSettings();
    return settings.passwordPolicy;
};
