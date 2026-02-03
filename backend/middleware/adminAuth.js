const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');

// Protect routes - verify JWT and admin status
exports.protect = async (req, res, next) => {
    try {
        let token;
        
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get admin from token
        const admin = await Admin.findById(decoded.id)
            .populate('role')
            .select('+password');
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin no longer exists'
            });
        }
        
        // Check if admin is active
        if (admin.status !== 'Active') {
            return res.status(403).json({
                success: false,
                message: `Account is ${admin.status.toLowerCase()}. Please contact system administrator.`
            });
        }
        
        // Check if account is locked
        if (admin.isAccountLocked()) {
            return res.status(403).json({
                success: false,
                message: 'Account is temporarily locked due to multiple failed login attempts'
            });
        }
        
        // Check if password was changed after token was issued
        if (admin.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({
                success: false,
                message: 'Password was recently changed. Please log in again.'
            });
        }
        
        // Grant access
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Check if admin has specific permission
exports.checkPermission = (...requiredPermissions) => {
    return async (req, res, next) => {
        try {
            const admin = req.admin;
            
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            
            // Get all permissions (role permissions + custom permissions)
            const rolePermissions = admin.role?.permissions || [];
            const customPermissions = admin.customPermissions || [];
            const allPermissions = [...new Set([...rolePermissions, ...customPermissions])];
            
            // Check if admin has required permission
            const hasPermission = requiredPermissions.some(permission => 
                allPermissions.includes(permission) || allPermissions.includes('*')
            );
            
            if (!hasPermission) {
                // Log unauthorized access attempt
                await ActivityLog.create({
                    performedBy: admin._id,
                    actionType: 'LOGIN_FAILED',
                    description: `Unauthorized access attempt to ${req.originalUrl}`,
                    metadata: {
                        requiredPermissions,
                        userPermissions: allPermissions
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                });
                
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action'
                });
            }
            
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    };
};

// Log activity
exports.logActivity = (actionType, getDescription) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;
        
        // Override send function
        res.send = function(data) {
            // Only log if request was successful
            if (res.statusCode >= 200 && res.statusCode < 300) {
                ActivityLog.create({
                    performedBy: req.admin._id,
                    targetAdmin: req.params.id || req.body.targetAdminId,
                    actionType,
                    description: typeof getDescription === 'function' ? getDescription(req) : getDescription,
                    metadata: {
                        body: req.body,
                        params: req.params,
                        query: req.query
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                }).catch(err => console.error('Failed to log activity:', err));
            }
            
            // Call original send
            originalSend.call(this, data);
        };
        
        next();
    };
};
