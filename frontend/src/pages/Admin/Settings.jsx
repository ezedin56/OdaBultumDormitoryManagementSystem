import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, Database, Shield, Save, RefreshCw, Trash2, Download, Upload } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile Settings
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        role: user?.role || ''
    });

    const [isEditingUsername, setIsEditingUsername] = useState(false);

    // Password Change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // System Settings
    const [systemSettings, setSystemSettings] = useState({
        autoAllocate: true,
        emailNotifications: true,
        maintenanceMode: false,
        maxStudentsPerRoom: 4
    });

    // Load system settings on mount
    useEffect(() => {
        const loadSystemSettings = async () => {
            try {
                const userInfo = localStorage.getItem('userInfo');
                if (!userInfo) return;

                const { token } = JSON.parse(userInfo);
                const response = await axios.get('http://localhost:5000/api/settings', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data) {
                    setSystemSettings({
                        autoAllocate: response.data.autoAllocate,
                        emailNotifications: response.data.emailNotifications,
                        maintenanceMode: response.data.maintenanceMode,
                        maxStudentsPerRoom: response.data.maxStudentsPerRoom
                    });
                }
            } catch (error) {
                console.error('Error loading system settings:', error);
            }
        };

        if (activeTab === 'system') {
            loadSystemSettings();
        }
    }, [activeTab]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        if (!profileData.username || !profileData.email) {
            showMessage('error', 'Username and email are required');
            return;
        }

        setLoading(true);
        try {
            // Get token from localStorage
            const userInfo = localStorage.getItem('userInfo');
            
            if (!userInfo) {
                showMessage('error', 'Authentication token not found. Please login again.');
                return;
            }

            const { token } = JSON.parse(userInfo);

            const response = await axios.put(
                'http://localhost:5000/api/auth/profile',
                {
                    username: profileData.username,
                    email: profileData.email
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                // Update localStorage with new user info
                const updatedUserInfo = {
                    ...response.data.user
                };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                
                setIsEditingUsername(false);
                showMessage('success', 'Profile updated successfully! Your changes have been saved.');
                
                // Reload page after 2 seconds to reflect changes
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update profile';
            showMessage('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('error', 'New passwords do not match!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showMessage('error', 'Password must be at least 6 characters!');
            return;
        }

        setLoading(true);
        try {
            // Get token from localStorage
            const userInfo = localStorage.getItem('userInfo');
            
            if (!userInfo) {
                showMessage('error', 'Authentication token not found. Please login again.');
                return;
            }

            const { token } = JSON.parse(userInfo);

            const response = await axios.put(
                'http://localhost:5000/api/auth/change-password',
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                showMessage('success', 'Password changed successfully! Please use your new password next time you login.');
            }
        } catch (error) {
            console.error('Password change error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to change password';
            showMessage('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSystemSettingsUpdate = async () => {
        if (systemSettings.maxStudentsPerRoom < 1 || systemSettings.maxStudentsPerRoom > 8) {
            showMessage('error', 'Maximum students per room must be between 1 and 8');
            return;
        }

        setLoading(true);
        try {
            const userInfo = localStorage.getItem('userInfo');
            
            if (!userInfo) {
                showMessage('error', 'Authentication token not found. Please login again.');
                return;
            }

            const { token } = JSON.parse(userInfo);

            const response = await axios.put(
                'http://localhost:5000/api/settings',
                systemSettings,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                showMessage('success', 'System settings updated successfully!');
                
                // Trigger a custom event to notify AdminLayout about the change
                window.dispatchEvent(new CustomEvent('maintenanceModeChanged', { 
                    detail: { maintenanceMode: systemSettings.maintenanceMode } 
                }));
            }
        } catch (error) {
            console.error('System settings update error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update system settings';
            showMessage('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDatabaseBackup = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/backup/database', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `database_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            showMessage('success', 'Database backup downloaded successfully!');
        } catch (error) {
            showMessage('error', 'Database backup feature coming soon!');
        } finally {
            setLoading(false);
        }
    };

    const handleClearCache = async () => {
        if (!window.confirm('Are you sure you want to clear the cache?')) return;
        
        setLoading(true);
        try {
            // Clear localStorage
            localStorage.removeItem('cachedData');
            showMessage('success', 'Cache cleared successfully!');
        } catch (error) {
            showMessage('error', 'Failed to clear cache');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ 
                    fontSize: '1.8rem', 
                    marginBottom: '0.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                }}>
                    <SettingsIcon size={28} color="#8b5cf6" />
                    Settings
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Manage your account, system preferences, and application settings
                </p>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '8px',
                    backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                borderBottom: '2px solid #e5e7eb',
                marginBottom: '2rem',
                overflowX: 'auto'
            }}>
                <TabButton 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')}
                    icon={<User size={18} />}
                    label="Profile"
                />
                <TabButton 
                    active={activeTab === 'security'} 
                    onClick={() => setActiveTab('security')}
                    icon={<Lock size={18} />}
                    label="Security"
                />
                <TabButton 
                    active={activeTab === 'system'} 
                    onClick={() => setActiveTab('system')}
                    icon={<SettingsIcon size={18} />}
                    label="System"
                />
                <TabButton 
                    active={activeTab === 'database'} 
                    onClick={() => setActiveTab('database')}
                    icon={<Database size={18} />}
                    label="Database"
                />
            </div>

            {/* Tab Content */}
            <div>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="card" style={{ maxWidth: '800px' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={20} />
                            Profile Information
                        </h3>
                        
                        <div style={{ 
                            marginBottom: '1.5rem', 
                            padding: '1rem', 
                            background: '#eff6ff', 
                            borderRadius: '8px',
                            borderLeft: '4px solid #3b82f6'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
                                <strong>Note:</strong> After changing your username, you'll need to use the new username to log in next time.
                            </p>
                        </div>

                        <form onSubmit={handleProfileUpdate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        Username *
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={profileData.username}
                                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                            disabled={!isEditingUsername}
                                            style={{ 
                                                background: isEditingUsername ? 'white' : '#f3f4f6', 
                                                cursor: isEditingUsername ? 'text' : 'not-allowed',
                                                flex: 1
                                            }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingUsername(!isEditingUsername)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                                        >
                                            {isEditingUsername ? 'Cancel' : 'Edit'}
                                        </button>
                                    </div>
                                    {isEditingUsername && (
                                        <p style={{ fontSize: '0.85rem', color: '#f59e0b', marginTop: '0.5rem' }}>
                                            ⚠️ You'll need to login with the new username
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={profileData.role}
                                        disabled
                                        style={{ background: '#f3f4f6', cursor: 'not-allowed', textTransform: 'capitalize' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    placeholder="admin@obu.edu.et"
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={loading}
                                style={{ gap: '0.5rem' }}
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="card" style={{ maxWidth: '800px' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Lock size={20} />
                            Change Password
                        </h3>
                        
                        <div style={{ 
                            marginBottom: '1.5rem', 
                            padding: '1rem', 
                            background: '#eff6ff', 
                            borderRadius: '8px',
                            borderLeft: '4px solid #3b82f6'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
                                <strong>Important:</strong> After changing your password, you'll need to use the new password the next time you log in.
                            </p>
                        </div>

                        <form onSubmit={handlePasswordChange}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Current Password *
                                </label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="Enter your current password"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    New Password *
                                </label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Enter new password (min 6 characters)"
                                    required
                                    autoComplete="new-password"
                                />
                                {passwordData.newPassword && passwordData.newPassword.length < 6 && (
                                    <p style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.5rem' }}>
                                        Password must be at least 6 characters
                                    </p>
                                )}
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Confirm New Password *
                                </label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm your new password"
                                    required
                                    autoComplete="new-password"
                                />
                                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                    <p style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.5rem' }}>
                                        Passwords do not match
                                    </p>
                                )}
                                {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                                    <p style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '0.5rem' }}>
                                        ✓ Passwords match
                                    </p>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                style={{ gap: '0.5rem', opacity: loading ? 0.6 : 1 }}
                            >
                                <Shield size={18} />
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </form>

                        <div style={{ 
                            marginTop: '2rem', 
                            padding: '1rem', 
                            background: '#f8fafc', 
                            borderRadius: '8px',
                            borderLeft: '4px solid #8b5cf6'
                        }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>Password Requirements:</h4>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                                <li>Minimum 6 characters long</li>
                                <li>Include uppercase and lowercase letters (recommended)</li>
                                <li>Include numbers and special characters (recommended)</li>
                                <li>Avoid using common words or personal information</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* System Tab */}
                {activeTab === 'system' && (
                    <div className="card" style={{ maxWidth: '800px' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <SettingsIcon size={20} />
                            System Preferences
                        </h3>

                        <div style={{ 
                            marginBottom: '1.5rem', 
                            padding: '1rem', 
                            background: '#eff6ff', 
                            borderRadius: '8px',
                            borderLeft: '4px solid #3b82f6'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
                                <strong>Note:</strong> These settings affect the entire system. Changes take effect immediately.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <SettingToggle
                                label="Auto-Allocate Students"
                                description="Automatically assign students to available rooms based on gender when they are imported or registered"
                                checked={systemSettings.autoAllocate}
                                onChange={(checked) => setSystemSettings({ ...systemSettings, autoAllocate: checked })}
                                icon="🏠"
                            />

                            <SettingToggle
                                label="Email Notifications"
                                description="Send email notifications to students and staff for important events, room assignments, and maintenance updates"
                                checked={systemSettings.emailNotifications}
                                onChange={(checked) => setSystemSettings({ ...systemSettings, emailNotifications: checked })}
                                icon="📧"
                            />

                            <SettingToggle
                                label="Maintenance Mode"
                                description="Enable maintenance mode to restrict student access to the system. Admin access remains available."
                                checked={systemSettings.maintenanceMode}
                                onChange={(checked) => {
                                    if (checked) {
                                        // Show confirmation when enabling maintenance mode
                                        if (window.confirm('⚠️ WARNING: Enabling maintenance mode will prevent all non-admin users from accessing the system.\n\nAre you sure you want to continue?')) {
                                            setSystemSettings({ ...systemSettings, maintenanceMode: checked });
                                        }
                                    } else {
                                        setSystemSettings({ ...systemSettings, maintenanceMode: checked });
                                    }
                                }}
                                icon="🔧"
                                warning={systemSettings.maintenanceMode}
                            />

                            <div style={{
                                padding: '1rem',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        fontWeight: 600,
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{ fontSize: '1.2rem' }}>👥</span>
                                        Maximum Students Per Room
                                    </label>
                                    <p style={{ 
                                        fontSize: '0.85rem', 
                                        color: 'var(--text-muted)',
                                        margin: '0 0 1rem 0'
                                    }}>
                                        Default capacity for new rooms. Existing rooms will not be affected.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={systemSettings.maxStudentsPerRoom}
                                        onChange={(e) => setSystemSettings({ 
                                            ...systemSettings, 
                                            maxStudentsPerRoom: parseInt(e.target.value) || 1 
                                        })}
                                        min="1"
                                        max="8"
                                        style={{ maxWidth: '120px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600' }}
                                    />
                                    <div style={{ 
                                        flex: 1,
                                        display: 'flex',
                                        gap: '0.5rem',
                                        alignItems: 'center'
                                    }}>
                                        <input
                                            type="range"
                                            min="1"
                                            max="8"
                                            value={systemSettings.maxStudentsPerRoom}
                                            onChange={(e) => setSystemSettings({ 
                                                ...systemSettings, 
                                                maxStudentsPerRoom: parseInt(e.target.value) 
                                            })}
                                            style={{ flex: 1 }}
                                        />
                                        <span style={{ 
                                            fontSize: '0.85rem', 
                                            color: 'var(--text-muted)',
                                            minWidth: '80px'
                                        }}>
                                            {systemSettings.maxStudentsPerRoom} {systemSettings.maxStudentsPerRoom === 1 ? 'student' : 'students'}
                                        </span>
                                    </div>
                                </div>
                                {(systemSettings.maxStudentsPerRoom < 1 || systemSettings.maxStudentsPerRoom > 8) && (
                                    <p style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.5rem' }}>
                                        Value must be between 1 and 8
                                    </p>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={handleSystemSettingsUpdate}
                            className="btn btn-primary" 
                            disabled={loading || systemSettings.maxStudentsPerRoom < 1 || systemSettings.maxStudentsPerRoom > 8}
                            style={{ gap: '0.5rem', marginTop: '2rem', opacity: loading ? 0.6 : 1 }}
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save System Settings'}
                        </button>
                    </div>
                )}

                {/* Database Tab */}
                {activeTab === 'database' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {/* Backup */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Download size={24} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Database Backup</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Export all data
                                    </p>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Download a complete backup of your database including students, rooms, and all records.
                            </p>
                            <button 
                                onClick={handleDatabaseBackup}
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', gap: '0.5rem' }}
                            >
                                <Download size={18} />
                                {loading ? 'Creating Backup...' : 'Download Backup'}
                            </button>
                        </div>

                        {/* Clear Cache */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <RefreshCw size={24} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Clear Cache</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Reset cached data
                                    </p>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Clear temporary data and cached information to improve performance.
                            </p>
                            <button 
                                onClick={handleClearCache}
                                className="btn btn-secondary"
                                disabled={loading}
                                style={{ width: '100%', gap: '0.5rem' }}
                            >
                                <RefreshCw size={18} />
                                Clear Cache
                            </button>
                        </div>

                        {/* System Info */}
                        <div className="card" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Database size={24} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>System Information</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Current status
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <InfoRow label="Version" value="1.0.0" />
                                <InfoRow label="Database" value="MongoDB" />
                                <InfoRow label="Last Backup" value="Never" />
                                <InfoRow label="Status" value="Active" color="#10b981" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Components
const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: active ? '#8b5cf6' : 'transparent',
            color: active ? 'white' : 'var(--text-main)',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: active ? '3px solid #8b5cf6' : 'none'
        }}
    >
        {icon}
        {label}
    </button>
);

const SettingToggle = ({ label, description, checked, onChange, icon, warning }) => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem',
        background: warning ? '#fef2f2' : '#f8fafc',
        borderRadius: '8px',
        border: warning ? '1px solid #fca5a5' : '1px solid #e5e7eb'
    }}>
        <div style={{ flex: 1 }}>
            <div style={{ 
                fontWeight: 600, 
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
                {label}
                {warning && (
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.5rem',
                        background: '#dc2626',
                        color: 'white',
                        borderRadius: '999px',
                        fontWeight: 600
                    }}>
                        ACTIVE
                    </span>
                )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{description}</div>
        </div>
        <label style={{ 
            position: 'relative', 
            display: 'inline-block', 
            width: '50px', 
            height: '26px',
            cursor: 'pointer',
            flexShrink: 0,
            marginLeft: '1rem'
        }}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: checked ? (warning ? '#dc2626' : '#8b5cf6') : '#cbd5e1',
                transition: '0.3s',
                borderRadius: '26px'
            }}>
                <span style={{
                    position: 'absolute',
                    content: '',
                    height: '20px',
                    width: '20px',
                    left: checked ? '27px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.3s',
                    borderRadius: '50%'
                }} />
            </span>
        </label>
    </div>
);

const InfoRow = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{label}:</span>
        <span style={{ 
            fontWeight: 600, 
            fontSize: '0.9rem',
            color: color || 'var(--text-main)'
        }}>
            {value}
        </span>
    </div>
);

export default Settings;
