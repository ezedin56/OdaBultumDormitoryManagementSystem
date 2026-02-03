import { useState, useRef } from 'react';
import { Shield, Users, Key, Activity, Clock, Settings, Lock } from 'lucide-react';
import AdminList from './AdminManagement/AdminList';
import CreateAdmin from './AdminManagement/CreateAdmin';
import RolesPermissions from './AdminManagement/RolesPermissions';
import ActivityLogs from './AdminManagement/ActivityLogs';
import LoginHistory from './AdminManagement/LoginHistory';
import SecuritySettings from './AdminManagement/SecuritySettings';

const AdminManagement = () => {
    const [activeTab, setActiveTab] = useState('admins');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const tabs = [
        { id: 'admins', label: 'Admin List', icon: <Users size={18} /> },
        { id: 'roles', label: 'Roles & Permissions', icon: <Key size={18} /> },
        { id: 'activity', label: 'Activity Logs', icon: <Activity size={18} /> },
        { id: 'login-history', label: 'Login History', icon: <Clock size={18} /> },
        { id: 'security', label: 'Security Settings', icon: <Lock size={18} /> }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'admins':
                return <AdminList key={refreshKey} onCreateClick={() => setShowCreateModal(true)} />;
            case 'roles':
                return <RolesPermissions />;
            case 'activity':
                return <ActivityLogs />;
            case 'login-history':
                return <LoginHistory />;
            case 'security':
                return <SecuritySettings />;
            default:
                return <AdminList key={refreshKey} onCreateClick={() => setShowCreateModal(true)} />;
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
                    <Shield size={28} color="#8b5cf6" />
                    Admin Management
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Manage administrators, roles, permissions, and security settings
                </p>
            </div>

            {/* Tabs */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '0.5rem',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: '1 1 auto',
                            minWidth: '150px',
                            padding: '0.75rem 1.25rem',
                            border: 'none',
                            background: activeTab === tab.id 
                                ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                                : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.background = '#f8fafc';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div>
                {renderContent()}
            </div>

            {/* Create Admin Modal */}
            {showCreateModal && (
                <CreateAdmin 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        setActiveTab('admins');
                        setRefreshKey(prev => prev + 1); // Trigger refresh
                    }}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminManagement;
