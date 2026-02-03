import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wrench, List, Hammer, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MaintenanceLayout = () => {
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
                backgroundColor: '#fefce8',
                borderRight: '1px solid #fde047',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid #fde047' }}>
                    <h3 style={{ color: '#ca8a04' }}>OBU DMS</h3>
                    <span style={{ fontSize: '0.8rem', color: '#854d0e' }}>Maintenance Portal</span>
                </div>

                <nav style={{ flex: 1, padding: 'var(--spacing-md)' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <NavItem to="/maintenance/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive('dashboard')} />
                        <NavItem to="/maintenance/my-tasks" icon={<Wrench size={20} />} label="My Tasks" active={isActive('my-tasks')} />
                        <NavItem to="/maintenance/all-requests" icon={<List size={20} />} label="All Requests" active={isActive('all-requests')} />
                        <NavItem to="/maintenance/tools" icon={<Hammer size={20} />} label="Tools" active={isActive('tools')} />
                    </ul>
                </nav>

                <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid #fde047' }}>
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
            <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-xl)', backgroundColor: '#fffbeb' }}>
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
                backgroundColor: active ? '#fde047' : 'transparent',
                color: active ? '#854d0e' : '#a16207',
                transition: 'all 0.2s',
                fontWeight: active ? 600 : 500
            }}
        >
            {icon}
            <span>{label}</span>
        </Link>
    </li>
);

export default MaintenanceLayout;
