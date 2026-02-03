import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building, Wrench, FileText, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
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
            <aside style={{ width: '260px', backgroundColor: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ color: 'var(--color-primary)' }}>OBU DMS</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Portal</span>
                </div>

                <nav style={{ flex: 1, padding: 'var(--spacing-md)' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive('dashboard')} />
                        <NavItem to="/admin/students" icon={<Users size={20} />} label="Students" active={isActive('students')} />
                        <NavItem to="/admin/dorms" icon={<Building size={20} />} label="Dormitories" active={isActive('dorms')} />
                        <NavItem to="/admin/maintenance" icon={<Wrench size={20} />} label="Maintenance" active={isActive('maintenance')} />
                        <NavItem to="/admin/inventory" icon={<Package size={20} />} label="Inventory" active={isActive('inventory')} />
                        <NavItem to="/admin/reports" icon={<FileText size={20} />} label="Reports" active={isActive('reports')} />
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
            <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-xl)', backgroundColor: 'var(--bg-color)' }}>
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
