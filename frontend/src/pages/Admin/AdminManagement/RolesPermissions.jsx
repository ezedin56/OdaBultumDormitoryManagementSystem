import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Shield } from 'lucide-react';
import axios from 'axios';

const RolesPermissions = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/admin/roles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(data.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (roleId, roleName) => {
        if (!window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/roles/${roleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRoles();
        } catch (error) {
            console.error('Failed to delete role:', error);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading roles...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Roles & Permissions</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Manage roles and assign permissions</p>
                </div>
                <button
                    onClick={() => {
                        setEditingRole(null);
                        setShowModal(true);
                    }}
                    className="btn btn-primary"
                    style={{ gap: '0.5rem' }}
                >
                    <Plus size={18} />
                    Create Role
                </button>
            </div>

            {/* Roles Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {roles.map(role => (
                    <div
                        key={role._id}
                        className="card"
                        style={{
                            padding: '1.5rem',
                            borderLeft: '4px solid #8b5cf6',
                            position: 'relative'
                        }}
                    >
                        {/* System Role Badge */}
                        {role.isSystemRole && (
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                padding: '0.25rem 0.75rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                <Shield size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                System Role
                            </div>
                        )}

                        {/* Role Header */}
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                                {role.name}
                            </h3>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                {role.description || 'No description'}
                            </p>
                        </div>

                        {/* Stats */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '1.5rem', 
                            marginBottom: '1rem',
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Admins</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>
                                    <Users size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                    {role.adminCount || 0}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Permissions</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                                    {role.permissions?.length || 0}
                                </div>
                            </div>
                        </div>

                        {/* Permissions Preview */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>
                                Permissions:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {role.permissions?.slice(0, 5).map((perm, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            background: '#ede9fe',
                                            color: '#7c3aed',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        {perm === '*' ? 'All Permissions' : perm}
                                    </span>
                                ))}
                                {role.permissions?.length > 5 && (
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: '#e2e8f0',
                                        color: '#475569',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        +{role.permissions.length - 5} more
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                onClick={() => {
                                    setEditingRole(role);
                                    setShowModal(true);
                                }}
                                className="btn btn-secondary"
                                style={{ flex: 1, gap: '0.5rem', fontSize: '0.9rem' }}
                            >
                                <Edit size={16} />
                                Edit
                            </button>
                            {!role.isSystemRole && (
                                <button
                                    onClick={() => handleDelete(role._id, role.name)}
                                    className="btn btn-secondary"
                                    style={{ 
                                        flex: 1, 
                                        gap: '0.5rem', 
                                        fontSize: '0.9rem',
                                        color: '#ef4444',
                                        borderColor: '#ef4444'
                                    }}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {roles.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No roles found. Create your first role to get started.
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <RoleModal
                    role={editingRole}
                    onClose={() => {
                        setShowModal(false);
                        setEditingRole(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setEditingRole(null);
                        fetchRoles();
                    }}
                />
            )}
        </div>
    );
};

// Role Modal Component
const RoleModal = ({ role, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: role?.name || '',
        description: role?.description || '',
        permissions: role?.permissions || []
    });
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/admin/roles/permissions/available', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailablePermissions(data.data);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    const handlePermissionToggle = (permission) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    const handleSelectAllModule = (module) => {
        const modulePermissions = module.permissions.map(p => p.value);
        const allSelected = modulePermissions.every(p => formData.permissions.includes(p));
        
        if (allSelected) {
            setFormData(prev => ({
                ...prev,
                permissions: prev.permissions.filter(p => !modulePermissions.includes(p))
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                permissions: [...new Set([...prev.permissions, ...modulePermissions])]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (role) {
                await axios.put(`http://localhost:5000/api/admin/roles/${role._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/admin/roles', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save role:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            overflowY: 'auto'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #e2e8f0',
                    position: 'sticky',
                    top: 0,
                    background: 'white',
                    zIndex: 10
                }}>
                    <h2 style={{ margin: 0 }}>{role ? 'Edit Role' : 'Create New Role'}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Role Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="input-field"
                                disabled={role?.isSystemRole}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="input-field"
                                rows={3}
                            />
                        </div>

                        <div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Permissions</h3>
                            {availablePermissions.map(module => (
                                <div key={module.module} style={{
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{module.module}</h4>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectAllModule(module)}
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                fontSize: '0.8rem',
                                                border: '1px solid #8b5cf6',
                                                background: 'white',
                                                color: '#8b5cf6',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            {module.permissions.every(p => formData.permissions.includes(p.value)) ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                        {module.permissions.map(permission => (
                                            <label
                                                key={permission.value}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    cursor: 'pointer',
                                                    padding: '0.5rem',
                                                    borderRadius: '6px',
                                                    background: formData.permissions.includes(permission.value) ? '#ede9fe' : 'white',
                                                    border: '1px solid',
                                                    borderColor: formData.permissions.includes(permission.value) ? '#8b5cf6' : '#e2e8f0'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(permission.value)}
                                                    onChange={() => handlePermissionToggle(permission.value)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{permission.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        padding: '1.5rem 2rem',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem',
                        position: 'sticky',
                        bottom: 0,
                        background: 'white'
                    }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (role ? 'Update Role' : 'Create Role')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RolesPermissions;
