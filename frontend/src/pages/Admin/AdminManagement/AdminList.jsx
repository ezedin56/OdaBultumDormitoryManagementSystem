import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Ban, CheckCircle, Key, Eye, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AdminList = ({ onCreateClick }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roles, setRoles] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchAdmins();
        fetchRoles();
    }, [searchTerm, roleFilter, statusFilter, pagination.page]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/admin/admins', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: pagination.page,
                    limit: 10,
                    search: searchTerm,
                    role: roleFilter,
                    status: statusFilter
                }
            });
            setAdmins(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/admin/roles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(data.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleSuspend = async (adminId) => {
        if (!window.confirm('Are you sure you want to suspend this admin?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/admins/${adminId}/suspend`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAdmins();
        } catch (error) {
            console.error('Failed to suspend admin:', error);
        }
    };

    const handleActivate = async (adminId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/admins/${adminId}/activate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAdmins();
        } catch (error) {
            console.error('Failed to activate admin:', error);
        }
    };

    const handleDelete = async (adminId) => {
        if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/admins/${adminId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAdmins();
        } catch (error) {
            console.error('Failed to delete admin:', error);
        }
    };

    const handleResetPassword = async (newPassword) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/admin/admins/${selectedAdmin._id}/reset-password`, 
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowResetModal(false);
            setSelectedAdmin(null);
            // Show success message
            alert('Password reset successfully!');
            fetchAdmins();
        } catch (error) {
            console.error('Failed to reset password:', error);
            alert(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const handleUpdate = async (updatedData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/admins/${selectedAdmin._id}`, 
                updatedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowEditModal(false);
            setSelectedAdmin(null);
            fetchAdmins();
        } catch (error) {
            console.error('Failed to update admin:', error);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Active: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={14} /> },
            Suspended: { bg: '#fef3c7', color: '#92400e', icon: <AlertCircle size={14} /> },
            Deactivated: { bg: '#fee2e2', color: '#991b1b', icon: <Ban size={14} /> }
        };
        const style = styles[status] || styles.Active;
        
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.75rem',
                background: style.bg,
                color: style.color,
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600
            }}>
                {style.icon}
                {status}
            </span>
        );
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading admins...</div>;
    }

    return (
        <div>
            {/* Header Actions */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1 1 300px' }}>
                        <Search size={18} style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: '#94a3b8' 
                        }} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.75rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            minWidth: '150px'
                        }}
                    >
                        <option value="">All Roles</option>
                        {roles.map(role => (
                            <option key={role._id} value={role._id}>{role.name}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            minWidth: '150px'
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Deactivated">Deactivated</option>
                    </select>
                </div>

                <button
                    onClick={onCreateClick}
                    className="btn btn-primary"
                    style={{ gap: '0.5rem', whiteSpace: 'nowrap' }}
                >
                    <Plus size={18} />
                    Create Admin
                </button>
            </div>

            {/* Admins Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ 
                                background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                                borderBottom: '2px solid #e2e8f0'
                            }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Username</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Role</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Department</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Last Login</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#475569' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin, index) => (
                                <tr 
                                    key={admin._id}
                                    style={{ 
                                        borderBottom: '1px solid #e2e8f0',
                                        background: index % 2 === 0 ? 'white' : '#fafafa'
                                    }}
                                >
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{admin.fullName}</div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>{admin.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: '#ede9fe',
                                            color: '#7c3aed',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                        }}>
                                            {admin.role?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>{admin.department || '-'}</td>
                                    <td style={{ padding: '1rem' }}>{getStatusBadge(admin.status)}</td>
                                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            {admin.email !== 'admin' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedAdmin(admin);
                                                        setShowEditModal(true);
                                                    }}
                                                    title="Edit"
                                                    style={{
                                                        padding: '0.5rem',
                                                        border: '1px solid #8b5cf6',
                                                        background: '#ede9fe',
                                                        color: '#6d28d9',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                            {admin.email !== 'admin' && (
                                                admin.status === 'Active' ? (
                                                    <button
                                                        onClick={() => handleSuspend(admin._id)}
                                                        title="Suspend"
                                                        style={{
                                                            padding: '0.5rem',
                                                            border: '1px solid #fbbf24',
                                                            background: '#fef3c7',
                                                            color: '#92400e',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivate(admin._id)}
                                                        title="Activate"
                                                        style={{
                                                            padding: '0.5rem',
                                                            border: '1px solid #10b981',
                                                            background: '#dcfce7',
                                                            color: '#166534',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedAdmin(admin);
                                                    setShowResetModal(true);
                                                }}
                                                title="Reset Password"
                                                style={{
                                                    padding: '0.5rem',
                                                    border: '1px solid #3b82f6',
                                                    background: '#dbeafe',
                                                    color: '#1e40af',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Key size={16} />
                                            </button>
                                            {admin.email !== 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(admin._id)}
                                                    title="Delete"
                                                    style={{
                                                        padding: '0.5rem',
                                                        border: '1px solid #ef4444',
                                                        background: '#fee2e2',
                                                        color: '#991b1b',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {admins.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        No admins found
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div style={{ 
                        padding: '1rem', 
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Showing {admins.length} of {pagination.total} admins
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                Previous
                            </button>
                            <span style={{ padding: '0.5rem 1rem', color: '#64748b' }}>
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reset Password Modal */}
            {showResetModal && (
                <ResetPasswordModal
                    admin={selectedAdmin}
                    onClose={() => {
                        setShowResetModal(false);
                        setSelectedAdmin(null);
                    }}
                    onSubmit={handleResetPassword}
                />
            )}

            {/* Edit Admin Modal */}
            {showEditModal && (
                <EditAdminModal
                    admin={selectedAdmin}
                    roles={roles}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedAdmin(null);
                    }}
                    onSubmit={handleUpdate}
                />
            )}
        </div>
    );
};

// Edit Admin Modal Component
const EditAdminModal = ({ admin, roles, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone || '',
        department: admin.department || '',
        role: admin.role?._id || '',
        status: admin.status
    });

    // Check if this is the Super Admin (email: "admin")
    const isSuperAdmin = admin.email === 'admin';

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
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
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <h3 style={{ marginBottom: '1.5rem' }}>
                    Edit Admin: {admin.fullName}
                    {isSuperAdmin && (
                        <span style={{ 
                            marginLeft: '0.5rem',
                            fontSize: '0.8rem',
                            color: '#dc2626',
                            fontWeight: 'normal'
                        }}>
                            (Super Admin - Limited Editing)
                        </span>
                    )}
                </h3>
                
                {isSuperAdmin && (
                    <div style={{
                        background: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        color: '#92400e'
                    }}>
                        ⚠️ Super Admin account: Only username and password can be changed. Role, status, and other fields are protected.
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            disabled={isSuperAdmin}
                            className="input-field"
                            style={{ opacity: isSuperAdmin ? 0.6 : 1, cursor: isSuperAdmin ? 'not-allowed' : 'text' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Email/Username *
                        </label>
                        <input
                            type="text"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="input-field"
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Phone
                        </label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={isSuperAdmin}
                            className="input-field"
                            style={{ opacity: isSuperAdmin ? 0.6 : 1, cursor: isSuperAdmin ? 'not-allowed' : 'text' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Department
                        </label>
                        <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            disabled={isSuperAdmin}
                            className="input-field"
                            style={{ opacity: isSuperAdmin ? 0.6 : 1, cursor: isSuperAdmin ? 'not-allowed' : 'text' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Role *
                        </label>
                        <input
                            type="text"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                            disabled={isSuperAdmin}
                            placeholder="e.g., Manager, Supervisor, Coordinator"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none',
                                opacity: isSuperAdmin ? 0.6 : 1,
                                cursor: isSuperAdmin ? 'not-allowed' : 'text',
                                backgroundColor: isSuperAdmin ? '#f3f4f6' : 'white'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Status *
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            required
                            disabled={isSuperAdmin}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none',
                                opacity: isSuperAdmin ? 0.6 : 1,
                                cursor: isSuperAdmin ? 'not-allowed' : 'pointer',
                                backgroundColor: isSuperAdmin ? '#f3f4f6' : 'white'
                            }}
                        >
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Deactivated">Deactivated</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Update Admin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Reset Password Modal Component
const ResetPasswordModal = ({ admin, onClose, onSubmit }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        onSubmit(newPassword);
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
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%'
            }}>
                <h3 style={{ marginBottom: '1rem' }}>Reset Password for {admin.fullName}</h3>
                {error && (
                    <div style={{
                        padding: '0.75rem',
                        background: '#fee2e2',
                        color: '#991b1b',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminList;
