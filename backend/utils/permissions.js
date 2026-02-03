// Define all available permissions grouped by module
const PERMISSIONS = {
    DASHBOARD: {
        VIEW_DASHBOARD: 'dashboard.view'
    },
    STUDENTS: {
        VIEW_STUDENTS: 'students.view',
        CREATE_STUDENT: 'students.create',
        EDIT_STUDENT: 'students.edit',
        DELETE_STUDENT: 'students.delete',
        IMPORT_STUDENTS: 'students.import',
        ALLOCATE_ROOMS: 'students.allocate'
    },
    DORMS: {
        VIEW_DORMS: 'dorms.view',
        CREATE_DORM: 'dorms.create',
        EDIT_DORM: 'dorms.edit',
        DELETE_DORM: 'dorms.delete',
        MANAGE_BLOCKS: 'dorms.manage_blocks'
    },
    INVENTORY: {
        VIEW_INVENTORY: 'inventory.view',
        CREATE_ASSET: 'inventory.create',
        EDIT_ASSET: 'inventory.edit',
        DELETE_ASSET: 'inventory.delete'
    },
    REPORTS: {
        VIEW_REPORTS: 'reports.view',
        GENERATE_REPORTS: 'reports.generate',
        EXPORT_REPORTS: 'reports.export'
    },
    ADMIN_MANAGEMENT: {
        VIEW_ADMINS: 'admins.view',
        CREATE_ADMIN: 'admins.create',
        EDIT_ADMIN: 'admins.edit',
        DELETE_ADMIN: 'admins.delete',
        SUSPEND_ADMIN: 'admins.suspend',
        ACTIVATE_ADMIN: 'admins.activate',
        RESET_PASSWORD: 'admins.reset_password',
        VIEW_ROLES: 'roles.view',
        CREATE_ROLE: 'roles.create',
        EDIT_ROLE: 'roles.edit',
        DELETE_ROLE: 'roles.delete',
        VIEW_ACTIVITY_LOGS: 'logs.view_activity',
        VIEW_LOGIN_HISTORY: 'logs.view_login',
        MANAGE_SECURITY: 'security.manage'
    },
    SYSTEM: {
        ALL_PERMISSIONS: '*'
    }
};

// Flatten permissions for easy access
const getAllPermissions = () => {
    const allPerms = [];
    Object.keys(PERMISSIONS).forEach(module => {
        Object.keys(PERMISSIONS[module]).forEach(key => {
            allPerms.push(PERMISSIONS[module][key]);
        });
    });
    return allPerms;
};

// Get permissions grouped by module for UI
const getPermissionsByModule = () => {
    return Object.keys(PERMISSIONS).map(module => ({
        module,
        permissions: Object.keys(PERMISSIONS[module]).map(key => ({
            key,
            value: PERMISSIONS[module][key],
            label: key.split('_').map(word => 
                word.charAt(0) + word.slice(1).toLowerCase()
            ).join(' ')
        }))
    }));
};

module.exports = {
    PERMISSIONS,
    getAllPermissions,
    getPermissionsByModule
};
