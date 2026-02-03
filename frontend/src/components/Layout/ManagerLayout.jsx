import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, FileText, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ManagerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname.includes(path);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: '#faf5ff',
                borderRight: '1px solid #e9d5ff',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid #e9d5ff' }}>
                    <h3 style={{ color: '#7c3aed' }}>OBU DMS</h3>
                    <span style={{ fontSize: '0.8rem', color: '#6b21a8' }}>Manager Portal</span>
                </div>

                <nav style={{ flex: 1, padding: 'var(--spacing-md)' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <NavItem to="/manager/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive('dashboard')} />
                        <NavItem to="/manager/reports" icon={<FileText size={20} />} label="Reports" active={isActive('reports')} />
                        <NavItem to="/manager/analytics" icon={<TrendingUp size={20} />} label="Analytics" active={isActive('analytics')} />
                        <NavItem to="/manager/settings" icon={<Settings size={20} />} label="Settings" active={isActive('settings')} />
                    </ul>
                </nav>

                <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid #e9d5ff' }}>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        gap: '0.75rem',
                        color: 'var(--color-danger)',
                        borderColor: 'transparent'
                    }}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-xl)', backgroundColor: '#fdf4ff' }}>
                <Outlet />
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
                backgroundColor: active ? '#e9d5ff' : 'transparent',
                color: active ? '#6b21a8' : '#9333ea',
                transition: 'all 0.2s',
                fontWeight: active ? 600 : 500
            }}
        >
            {icon}
            <span>{label}</span>
        </Link>
    </li>
);

export default ManagerLayout;
