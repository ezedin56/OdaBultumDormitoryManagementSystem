const Role = require('../models/Role');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const { getPermissionsByModule } = require('../utils/permissions');

// @desc    Get all roles
// @route   GET /api/admin/roles
// @access  Private (roles.view)
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find()
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 });
        
        // Get admin count for each role
        const rolesWithCount = await Promise.all(
            roles.map(async (role) => {
                const adminCount = await Admin.countDocuments({ role: role._id });
                return {
                    ...role.toObject(),
                    adminCount
                };
            })
        );
        
        res.status(200).json({
            success: true,
            data: rolesWithCount
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching roles'
        });
    }
};

// @desc    Get single role
// @route   GET /api/admin/roles/:id
// @access  Private (roles.view)
exports.getRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id)
            .populate('createdBy', 'fullName email');
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
        
        const adminCount = await Admin.countDocuments({ role: role._id });
        
        res.status(200).json({
            success: true,
            data: {
                ...role.toObject(),
                adminCount
            }
        });
    } catch (error) {
        console.error('Get role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching role'
        });
    }
};

// @desc    Create new role
// @route   POST /api/admin/roles
// @access  Private (roles.create)
exports.createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Role name is required'
            });
        }
        
        // Check if role name already exists
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: 'Role name already exists'
            });
        }
        
        const role = await Role.create({
            name,
            description,
            permissions: permissions || [],
            createdBy: req.admin._id
        });
        
        // Log activity
        await ActivityLog.create({
            performedBy: req.admin._id,
            actionType: 'ROLE_CREATED',
            description: `Created new role: ${name}`,
            metadata: { permissions },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: role
        });
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating role'
        });
    }
};

// @desc    Update role
// @route   PUT /api/admin/roles/:id
// @access  Private (roles.edit)
exports.updateRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        
        const role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
        
        // Check if admin has Super Admin role (can edit system roles)
        const admin = await Admin.findById(req.admin._id).populate('role');
        const isSuperAdmin = admin.role?.permissions?.includes('*');
        
        // Prevent editing system roles unless Super Admin
        if (role.isSystemRole && !isSuperAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can edit system roles'
            });
        }
        
        // Check if new name already exists
        if (name && name !== role.name) {
            const existingRole = await Role.findOne({ name });
            if (existingRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Role name already exists'
                });
            }
        }
        
        if (name) role.name = name;
        if (description !== undefined) role.description = description;
        if (permissions) role.permissions = permissions;
        
        await role.save();
        
        // Log activity
        await ActivityLog.create({
            performedBy: req.admin._id,
            actionType: 'ROLE_UPDATED',
            description: `Updated role: ${role.name}`,
            metadata: req.body,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: role
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating role'
        });
    }
};

// @desc    Delete role
// @route   DELETE /api/admin/roles/:id
// @access  Private (roles.delete)
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
        
        // Check if admin has Super Admin role
        const admin = await Admin.findById(req.admin._id).populate('role');
        const isSuperAdmin = admin.role?.permissions?.includes('*');
        
        // Prevent deleting system roles unless Super Admin
        if (role.isSystemRole && !isSuperAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can delete system roles'
            });
        }
        
        // Check if any admins are assigned to this role
        const adminCount = await Admin.countDocuments({ role: role._id });
        if (adminCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete role. ${adminCount} admin(s) are assigned to this role.`
            });
        }
        
        await role.deleteOne();
        
        // Log activity
        await ActivityLog.create({
            performedBy: req.admin._id,
            actionType: 'ROLE_DELETED',
            description: `Deleted role: ${role.name}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.status(200).json({
            success: true,
            message: 'Role deleted successfully'
        });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting role'
        });
    }
};

// @desc    Get available permissions
// @route   GET /api/admin/roles/permissions/available
// @access  Private (roles.view)
exports.getAvailablePermissions = async (req, res) => {
    try {
        const permissions = getPermissionsByModule();
        
        res.status(200).json({
            success: true,
            data: permissions
        });
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching permissions'
        });
    }
};

module.exports = exports;
