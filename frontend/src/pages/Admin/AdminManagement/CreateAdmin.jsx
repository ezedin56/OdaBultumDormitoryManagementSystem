import { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const CreateAdmin = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        department: '',
        role: '',
        customPermissions: []
    });
    const [permissions, setPermissions] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/admin/roles/permissions/available', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPermissions(data.data);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handlePermissionToggle = (permission) => {
        setFormData(prev => ({
            ...prev,
            customPermissions: prev.customPermissions.includes(permission)
                ? prev.customPermissions.filter(p => p !== permission)
                : [...prev.customPermissions, permission]
        }));
    };

    const handleSelectAllModule = (module) => {
        const modulePermissions = module.permissions.map(p => p.value);
        const allSelected = modulePermissions.every(p => formData.customPermissions.includes(p));
        
        if (allSelected) {
            setFormData(prev => ({
                ...prev,
                customPermissions: prev.customPermissions.filter(p => !modulePermissions.includes(p))
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                customPermissions: [...new Set([...prev.customPermissions, ...modulePermissions])]
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Username is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.role) newErrors.role = 'Role is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let roleId = formData.role;
            
            // Check if role is a text name (not a MongoDB ObjectId)
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(formData.role);
            
            if (!isObjectId) {
                // It's a role name, we need to find or create it
                try {
                    // Fetch all existing roles
                    const rolesResponse = await axios.get('http://localhost:5000/api/admin/roles', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    // Check if role with this name already exists
                    const existingRole = rolesResponse.data.data.find(
                        r => r.name.toLowerCase() === formData.role.trim().toLowerCase()
                    );
                    
                    if (existingRole) {
                        // Use existing role ID
                        roleId = existingRole._id;
                        
                        // If custom permissions are provided, update the role
                        if (formData.customPermissions && formData.customPermissions.length > 0) {
                            await axios.put(`http://localhost:5000/api/admin/roles/${roleId}`, {
                                permissions: [...new Set([...existingRole.permissions, ...formData.customPermissions])]
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                        }
                    } else {
                        // Create new role with the provided name and permissions
                        const newRoleResponse = await axios.post('http://localhost:5000/api/admin/roles', {
                            name: formData.role.trim(),
                            description: `${formData.role.trim()} role`,
                            permissions: formData.customPermissions || []
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        roleId = newRoleResponse.data.data._id;
                    }
                } catch (roleError) {
                    console.error('Role creation/fetch error:', roleError);
                    const errorMsg = roleError.response?.data?.message || 'Failed to create/find role';
                    alert(`Error: ${errorMsg}`);
                    setLoading(false);
                    return;
                }
            }
            
            // Create the admin with the role ID
            const adminData = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                department: formData.department,
                role: roleId,
                customPermissions: formData.customPermissions || []
            };
            
            await axios.post('http://localhost:5000/api/admin/admins', adminData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Admin created successfully!');
            onSuccess();
        } catch (error) {
            console.error('Failed to create admin:', error);
            const errorMsg = error.response?.data?.message || 'Failed to create admin. Please try again.';
            alert(`Error: ${errorMsg}`);
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
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: 'white',
                    zIndex: 10
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Create New Admin</h2>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            borderRadius: '6px'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '2rem' }}>
                        {/* Basic Information */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Basic Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="input-field"
                                        style={{ borderColor: errors.fullName ? '#ef4444' : '#e2e8f0' }}
                                    />
                                    {errors.fullName && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.fullName}</span>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="e.g., john_admin, manager01"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid',
                                            borderColor: errors.email ? '#ef4444' : '#e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                    {errors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.email}</span>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Department
                                    </label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Password *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="input-field"
                                            style={{ borderColor: errors.password ? '#ef4444' : '#e2e8f0', paddingRight: '2.5rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '0.75rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.password}</span>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Confirm Password *
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input-field"
                                        style={{ borderColor: errors.confirmPassword ? '#ef4444' : '#e2e8f0' }}
                                    />
                                    {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.confirmPassword}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Role Name */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Role Name *</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Enter the role name for this admin
                            </p>
                            {errors.role && <span style={{ color: '#ef4444', fontSize: '0.9rem', display: 'block', marginBottom: '1rem' }}>{errors.role}</span>}
                            
                            <input
                                type="text"
                                name="roleName"
                                value={formData.role}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, role: e.target.value }));
                                    setErrors(prev => ({ ...prev, role: '' }));
                                }}
                                placeholder="e.g., Manager, Supervisor, Coordinator"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid',
                                    borderColor: errors.role ? '#ef4444' : '#e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Custom Permissions */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                                Custom Permissions (Optional)
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Add additional permissions beyond the selected role
                            </p>
                            
                            {permissions.map(module => (
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
                                            {module.permissions.every(p => formData.customPermissions.includes(p.value)) ? 'Deselect All' : 'Select All'}
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
                                                    background: formData.customPermissions.includes(permission.value) ? '#ede9fe' : 'white',
                                                    border: '1px solid',
                                                    borderColor: formData.customPermissions.includes(permission.value) ? '#8b5cf6' : '#e2e8f0'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.customPermissions.includes(permission.value)}
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

                    {/* Footer */}
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
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ gap: '0.5rem' }}
                        >
                            <Save size={18} />
                            {loading ? 'Creating...' : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAdmin;
