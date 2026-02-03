import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building, FileText, LogOut, Settings, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminLayout = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Get user permissions
    const userPermissions = user?.permissions || [];
    const hasPermission = (permission) => {
        return userPermissions.includes('*') || userPermissions.includes(permission);
    };

    useEffect(() => {
        const checkMaintenanceMode = async () => {
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
                    setMaintenanceMode(response.data.maintenanceMode);
                }
            } catch (error) {
                console.error('Error checking maintenance mode:', error);
            }
        };

        checkMaintenanceMode();
        
        // Listen for maintenance mode changes
        const handleMaintenanceModeChange = (event) => {
            setMaintenanceMode(event.detail.maintenanceMode);
        };
        window.addEventListener('maintenanceModeChanged', handleMaintenanceModeChange);
        
        // Check every 30 seconds
        const interval = setInterval(checkMaintenanceMode, 30000);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('maintenanceModeChanged', handleMaintenanceModeChange);
        };
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/login'; // Force full page redirect
    };

    const isActive = (path) => location.pathname.includes(path);

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', backgroundColor: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpWVhGUfDQPtwCOjcwTE3tQiAl0obKpwvN1A&s" 
                        alt="OBU Logo" 
                        style={{ 
                            width: '45px', 
                            height: '45px', 
                            objectFit: 'contain',
                            borderRadius: '8px'
                        }} 
                    />
                    <div>
                        <h3 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '1.1rem' }}>OBU DMS</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Portal</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: 'var(--spacing-md)' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {hasPermission('dashboard.view') && (
                            <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive('dashboard')} />
                        )}
                        {hasPermission('students.view') && (
                            <NavItem to="/admin/students" icon={<Users size={20} />} label="Students" active={isActive('students')} />
                        )}
                        {hasPermission('dorms.view') && (
                            <NavItem to="/admin/dorms" icon={<Building size={20} />} label="Dormitories" active={isActive('dorms')} />
                        )}
                        {hasPermission('reports.view') && (
                            <NavItem to="/admin/reports" icon={<FileText size={20} />} label="Reports" active={isActive('reports')} />
                        )}
                        {hasPermission('admins.view') && (
                            <NavItem to="/admin/admin-management" icon={<Shield size={20} />} label="Admin Management" active={isActive('admin-management')} />
                        )}
                        {hasPermission('dashboard.view') && (
                            <NavItem to="/admin/settings" icon={<Settings size={20} />} label="Settings" active={isActive('settings')} />
                        )}
                    </ul>
                </nav>

                <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', color: 'var(--color-danger)', borderColor: 'transparent' }}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
                {/* Maintenance Mode Banner */}
                {maintenanceMode && (
                    <div style={{
                        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                        color: 'white',
                        padding: '1rem 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        animation: 'slideDown 0.3s ease-out'
                    }}>
                        <AlertTriangle size={24} />
                        <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: '1rem' }}>⚠️ MAINTENANCE MODE ACTIVE</strong>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', opacity: 0.95 }}>
                                The system is in maintenance mode. Only administrators can access the system.
                            </p>
                        </div>
                        <Link 
                            to="/admin/settings"
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '6px',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            Disable
                        </Link>
                    </div>
                )}
                
                <div style={{ flex: 1, padding: 'var(--spacing-xl)' }}>
                    <Outlet />
                </div>

                <style>{`
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label, active }) => (
    <li>
        <Link
            to={to}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: active ? 'var(--color-primary-light)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--text-main)',
                transition: 'all 0.2s'
            }}
        >
            {icon}
            <span style={{ fontWeight: 500 }}>{label}</span>
        </Link>
    </li>
);

export default AdminLayout;
