const SecuritySettings = require('../models/SecuritySettings');
const ActivityLog = require('../models/ActivityLog');
const { getPasswordPolicy } = require('../utils/passwordValidator');

// @desc    Get security settings
// @route   GET /api/admin/security/settings
// @access  Private (security.manage)
exports.getSecuritySettings = async (req, res) => {
    try {
        const settings = await SecuritySettings.getSettings();
        
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching security settings'
        });
    }
};

// @desc    Update security settings
// @route   PUT /api/admin/security/settings
// @access  Private (security.manage)
exports.updateSecuritySettings = async (req, res) => {
    try {
        const settings = await SecuritySettings.getSettings();
        
        const { passwordPolicy, loginSecurity, ipRestrictions } = req.body;
        
        if (passwordPolicy) {
            settings.passwordPolicy = {
                ...settings.passwordPolicy,
                ...passwordPolicy
            };
        }
        
        if (loginSecurity) {
            settings.loginSecurity = {
                ...settings.loginSecurity,
                ...loginSecurity
            };
        }
        
        if (ipRestrictions) {
            settings.ipRestrictions = {
                ...settings.ipRestrictions,
                ...ipRestrictions
            };
        }
        
        settings.updatedBy = req.admin._id;
        await settings.save();
        
        // Log activity
        await ActivityLog.create({
            performedBy: req.admin._id,
            actionType: 'SECURITY_SETTINGS_UPDATED',
            description: 'Updated security settings',
            metadata: req.body,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.status(200).json({
            success: true,
            message: 'Security settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Update security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating security settings'
        });
    }
};

// @desc    Get password policy
// @route   GET /api/admin/security/password-policy
// @access  Public
exports.getPasswordPolicyPublic = async (req, res) => {
    try {
        const policy = await getPasswordPolicy();
        
        res.status(200).json({
            success: true,
            data: policy
        });
    } catch (error) {
        console.error('Get password policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching password policy'
        });
    }
};

module.exports = exports;
