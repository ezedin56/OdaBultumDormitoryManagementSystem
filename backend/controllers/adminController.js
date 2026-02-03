const Admin = require('../models/Admin');
const Role = require('../models/Role');
const ActivityLog = require('../models/ActivityLog');
const LoginHistory = require('../models/LoginHistory');
const SecuritySettings = require('../models/SecuritySettings');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validatePassword } = require('../utils/passwordValidator');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '24h'
    });
};

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }
        
        // Find admin
        const admin = await Admin.findOne({ email })
            .select('+password')
            .populate('role');
        
        if (!admin) {
            // Log failed attempt
            await LoginHistory.create({
                admin: null,
                success: false,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                failureReason: 'Invalid credentials'
            });
            
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Check if account is locked
        if (admin.isAccountLocked()) {
            await LoginHistory.create({
                admin: admin._id,
                success: false,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                failureReason: 'Account locked'
            });
            
            return res.status(403).json({
                success: false,
                message: 'Account is temporarily locked due to multiple failed login attempts'
            });
        }
        
        // Check account status
        if (admin.status !== 'Active') {
            await LoginHistory.create({
                admin: admin._id,
                success: false,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                failureReason: `Account ${admin.status.toLowerCase()}`
            });
            
            return res.status(403).json({
                success: false,
                message: `Account is ${admin.status.toLowerCase()}. Please contact system administrator.`
            });
        }
        
        // Check password
        const isPasswordCorrect = await admin.comparePassword(password);
        
        if (!isPasswordCorrect) {
            // Increment failed attempts
            await admin.incrementLoginAttempts();
            
            await LoginHistory.create({
                admin: admin._id,
                success: false,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                failureReason: 'Invalid credentials'
            });
            
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Reset failed attempts on successful login
        await admin.resetLoginAttempts();
        
        // Update last login
        admin.lastLogin = Date.now();
        admin.lastLoginIP = req.ip;
        await admin.save();
        
        // Log successful login
        await LoginHistory.create({
            admin: admin._id,
            success: true,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        await ActivityLog.create({
            performedBy: admin._id,
            actionType: 'LOGIN_SUCCESS',
            description: 'Admin logged in successfully',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        // Generate token
        const token = generateToken(admin._id);
        
        // Remove password from output
        admin.password = undefined;
        
        res.status(200).json({
            success: true,
            token,
            admin: {
                id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                role: admin.role,
                permissions: [...(admin.role?.permissions || []), ...(admin.customPermissions || [])]
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private (admins.view)
exports.getAllAdmins = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
        
        // Build query
        const query = {};
        
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (role) {
            query.role = role;
        }
        
        if (status) {
            query.status = status;
        }
        
        // Execute query with pagination
        const admins = await Admin.find(query)
            .populate('role', 'name')
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await Admin.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: admins,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admins'
        });
    }
};

// @desc    Get single admin
// @route   GET /api/admin/admins/:id
// @access  Private (admins.view)
exports.getAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id)
            .populate('role')
            .populate('createdBy', 'fullName email')
            .select('-password');
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        console.error('Get admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin'
        });
    }
};

// @desc    Create new admin
// @route   POST /api/admin/admins
// @access  Private (admins.create)
exports.createAdmin = async (req, res) => {
    try {
        const { fullName, email, password, phone, department, role, customPermissions } = req.body;
        
        // Validate required fields
        if (!fullName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }
        
        // Validate password
        const passwordValidation = await validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors
            });
        }
        
        // Check if email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }
        
        // Verify role exists
        const roleDoc = await Role.findById(role);
        if (!roleDoc) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }
        
        // Create admin
        const admin = await Admin.create({
            fullName,
            email,
            password,
            phone,
            department,
            role,
            customPermissions: customPermissions || [],
            createdBy: req.admin._id
        });
        
        // Log activity
        await ActivityLog.create({
            performedBy: req.admin._id,
            targetAdmin: admin._id,
            actionType: 'ADMIN_CREATED',
            description: `Created new admin: ${fullName} (${email})`,
            metadata: { role: roleDoc.name },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        // Return admin without password
        const adminData = await Admin.findById(admin._id)
            .populate('role')
            .select('-password');
        
        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: adminData
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating admin'
        });
    }
};

// @desc    Update admin
// @route   PUT /api/admin/admins/:id
// @access  Private (admins.edit)
exports.updateAdmin = async (req, res) => {
    try {
        const { fullName, email, phone, department, role, customPermissions, status } = req.body;
        
        const admin = await Admin.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        // Prevent self-status change
        if (status && admin._id.toString() === req.admin._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own account status'
            });
        }
        
        // Update fields
        if (fullName) admin.fullName = fullName;
        if (email) admin.email = email;
        if (phone) admin.phone = phone;
        if (department) admin.department = department;
        if (role) admin.role = role;
        if (customPermissions) admin.customPermissions = customPermissions;
        if (status) admin.status = status;
        
        await admin.save();
        
        // Log activity
        await ActivityLog.create({
            performedBy: req.admin._id,
            targetAdmin: admin._id,
            actionType: 'ADMIN_UPDATED',
            description: `Updated admin: ${admin.fullName}`,
            metadata: req.body,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        const updatedAdmin = await Admin.findById(admin._id)
            .populate('role')
            .select('-password');
        
        res.status(200).json({
            success: true,
            message: 'Admin updated successfully',
            data: updatedAdmin
        });
    } catch (error) {
        console.error('Update admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating admin'
        });
    }
};

// @desc    Delete admin
// @route   DELETE /api/admin/admins/:id
// @access  Private (admins.delete)
exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        // Prevent self-deletion
        if (admin._id.toString() === req.admin._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }
        
        await admin.deleteOne();
        
        // Log activity
        await ActivityLog.create({
            performedBy: req.admin._id,
            targetAdmin: admin._id,
            actionType: 'ADMIN_DELETED',
            description: `Deleted admin: ${admin.fullName} (${admin.email})`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting admin'
        });
    }
};

// @desc    Suspend admin
// @route   PUT /api/admin/admins/:id/suspend
// @access  Private (admins.suspend)
exports.suspendAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        // Prevent self-suspension
        if (admin._id.toString() === req.admin._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot suspend your own account'
            });
        }
        
        admin.status = 'Suspended';
        await admin.save();
        
        // Log activity
        await ActivityLog.create({
            performedBy: req.admin._id,
            targetAdmin: admin._id,
            actionType: 'ADMIN_SUSPENDED',
            description: `Suspended admin: ${admin.fullName}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.status(200).json({
            success: true,
            message: 'Admin suspended successfully'
        });
    } catch (error) {
        console.error('Suspend admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error suspending admin'
        });
    }
};

// @desc    Activate admin
// @route   PUT /api/admin/admins/:id/activate
// @access  Private (admins.activate)
exports.activateAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        admin.status = 'Active';
        await admin.save();
        
        // Log activity
        await ActivityLog.create({
            performedBy: req.admin._id,
            targetAdmin: admin._id,
            actionType: 'ADMIN_ACTIVATED',
            description: `Activated admin: ${admin.fullName}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.status(200).json({
            success: true,
            message: 'Admin activated successfully'
        });
    } catch (error) {
        console.error('Activate admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating admin'
        });
    }
};

// @desc    Reset admin password
// @route   POST /api/admin/admins/:id/reset-password
// @access  Private (admins.reset_password)
exports.resetAdminPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        
        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide new password'
            });
        }
        
        // Validate password
        const passwordValidation = await validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors
            });
        }
        
        const admin = await Admin.findById(req.params.id).select('+password');
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        admin.password = newPassword;
        admin.passwordChangedAt = Date.now();
        await admin.save();
        
        // Log activity
        await ActivityLog.create({
            performedBy: req.admin._id,
            targetAdmin: admin._id,
            actionType: 'PASSWORD_RESET',
            description: `Reset password for admin: ${admin.fullName}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
};

module.exports = exports;
