const express = require('express');
const router = express.Router();
const { protect, checkPermission, logActivity } = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const roleController = require('../controllers/roleController');
const activityLogController = require('../controllers/activityLogController');
const securityController = require('../controllers/securityController');
const { PERMISSIONS } = require('../utils/permissions');

// Auth routes
router.post('/auth/login', adminController.login);

// Password policy (public)
router.get('/security/password-policy', securityController.getPasswordPolicyPublic);

// Protected routes - require authentication
router.use(protect);

// Admin management routes
router.get('/admins', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.VIEW_ADMINS),
    adminController.getAllAdmins
);

router.get('/admins/:id', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.VIEW_ADMINS),
    adminController.getAdmin
);

router.post('/admins', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.CREATE_ADMIN),
    logActivity('ADMIN_CREATED', req => `Created admin: ${req.body.fullName}`),
    adminController.createAdmin
);

router.put('/admins/:id', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.EDIT_ADMIN),
    logActivity('ADMIN_UPDATED', req => `Updated admin ID: ${req.params.id}`),
    adminController.updateAdmin
);

router.delete('/admins/:id', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.DELETE_ADMIN),
    logActivity('ADMIN_DELETED', req => `Deleted admin ID: ${req.params.id}`),
    adminController.deleteAdmin
);

router.put('/admins/:id/suspend', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.SUSPEND_ADMIN),
    logActivity('ADMIN_SUSPENDED', req => `Suspended admin ID: ${req.params.id}`),
    adminController.suspendAdmin
);

router.put('/admins/:id/activate', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.ACTIVATE_ADMIN),
    logActivity('ADMIN_ACTIVATED', req => `Activated admin ID: ${req.params.id}`),
    adminController.activateAdmin
);

router.post('/admins/:id/reset-password', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.RESET_PASSWORD),
    logActivity('PASSWORD_RESET', req => `Reset password for admin ID: ${req.params.id}`),
    adminController.resetAdminPassword
);

// Role management routes
router.get('/roles', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.VIEW_ROLES),
    roleController.getAllRoles
);

router.get('/roles/permissions/available', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.VIEW_ROLES),
    roleController.getAvailablePermissions
);

router.get('/roles/:id', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.VIEW_ROLES),
    roleController.getRole
);

router.post('/roles', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.CREATE_ROLE),
    logActivity('ROLE_CREATED', req => `Created role: ${req.body.name}`),
    roleController.createRole
);

router.put('/roles/:id', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.EDIT_ROLE),
    logActivity('ROLE_UPDATED', req => `Updated role ID: ${req.params.id}`),
    roleController.updateRole
);

router.delete('/roles/:id', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.DELETE_ROLE),
    logActivity('ROLE_DELETED', req => `Deleted role ID: ${req.params.id}`),
    roleController.deleteRole
);

// Activity logs routes
router.get('/activity-logs', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.VIEW_ACTIVITY_LOGS),
    activityLogController.getActivityLogs
);

// Login history routes
router.get('/login-history', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.VIEW_LOGIN_HISTORY),
    activityLogController.getLoginHistory
);

router.get('/login-history/:adminId', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.VIEW_LOGIN_HISTORY),
    activityLogController.getAdminLoginHistory
);

// Security settings routes
router.get('/security/settings', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.MANAGE_SECURITY),
    securityController.getSecuritySettings
);

router.put('/security/settings', 
    checkPermission(PERMISSIONS.ADMIN_MANAGEMENT.MANAGE_SECURITY),
    logActivity('SECURITY_SETTINGS_UPDATED', 'Updated security settings'),
    securityController.updateSecuritySettings
);

module.exports = router;
