import {
    Users, Building, Wrench, AlertTriangle, ArrowUp, ArrowRight,
    Activity, Clock, CheckCircle2, MoreHorizontal, Calendar,
    PieChart, BarChart3, UserPlus, FileText
} from 'lucide-react';

const Dashboard = () => {
    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'white' }}>Welcome back, Admin</h1>
                        <p style={{ opacity: 0.8, maxWidth: '600px' }}>
                            Here's what's happening across the campus today. You have 3 pending maintenance requests and 12 new student registrations.
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'none', md: { display: 'block' } }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Current Term</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24' }}>Spring 2024</div>
                    </div>
                </div>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.1)' }} />
                <div style={{ position: 'absolute', bottom: '-40%', right: '20%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)' }} />
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Total Students"
                    value="4,250"
                    change="+12% vs last month"
                    icon={<Users size={24} color="#3b82f6" />}
                    trend="up"
                />
                <StatCard
                    title="Dorm Occupancy"
                    value="87%"
                    change="+2.4% vs last week"
                    icon={<Building size={24} color="#ca8a04" />}
                    trend="up"
                />
                <StatCard
                    title="Maintenance"
                    value="14"
                    change="Pending Requests"
                    icon={<Wrench size={24} color="#ef4444" />}
                    trend="down"
                    alert
                />
                <StatCard
                    title="Staff Active"
                    value="28"
                    change="Currently on duty"
                    icon={<Activity size={24} color="#10b981" />}
                    trend="neutral"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Main Content Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Occupancy Chart Section (Visual Mock) */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <BarChart3 size={20} color="#64748b" /> Campus Occupancy
                            </h3>
                            <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>View Details</button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', height: '200px', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                            {['Block A', 'Block B', 'Block C', 'Block D', 'Block E'].map((block, i) => (
                                <div key={block} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '100%',
                                        height: `${[85, 92, 65, 78, 45][i]}%`,
                                        backgroundColor: i === 2 || i === 4 ? '#e2e8f0' : '#3b82f6',
                                        borderRadius: '8px 8px 0 0',
                                        transition: 'height 1s ease',
                                        minHeight: '20px',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ color: i === 2 || i === 4 ? '#64748b' : 'white', fontSize: '0.75rem', paddingBottom: '4px', fontWeight: 600 }}>
                                            {[85, 92, 65, 78, 45][i]}%
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{block}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Requests */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <Clock size={20} color="#64748b" /> Recent Activity
                            </h3>
                            <LinkToAll />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ActivityItem
                                icon={<UserPlus size={18} color="#3b82f6" />}
                                title="New Student Registration"
                                desc="Ahmed Mohammed assigned to Block A-102"
                                time="2 mins ago"
                            />
                            <ActivityItem
                                icon={<Wrench size={18} color="#ef4444" />}
                                title="Maintenance Reported"
                                desc="Plumbing issue in Block B-201"
                                time="15 mins ago"
                            />
                            <ActivityItem
                                icon={<CheckCircle2 size={18} color="#10b981" />}
                                title="Room Inspection"
                                desc="Block C 2nd floor inspection completed"
                                time="1 hour ago"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Quick Actions */}
                    <div className="card" style={{ background: 'linear-gradient(to bottom, #ffffff, #f8fafc)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <QuickActionBtn label="Register Student" icon={<UserPlus size={18} />} color="primary" />
                            <QuickActionBtn label="Assign Room" icon={<Building size={18} />} color="secondary" />
                            <QuickActionBtn label="Create Report" icon={<FileText size={18} />} color="secondary" />
                            <QuickActionBtn label="System Settings" icon={<MoreHorizontal size={18} />} color="secondary" />
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>System Health</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <StatusItem label="Database" status="Operational" color="#10b981" />
                            <StatusItem label="API Server" status="Operational" color="#10b981" />
                            <StatusItem label="Backup" status="Processing..." color="#ca8a04" />
                        </div>
                    </div>

                    {/* Calendar Widget Preview */}
                    <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <Calendar size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>Oct 24</div>
                        <div style={{ color: '#64748b' }}>Thursday</div>
                        <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.85rem' }}>
                            No events scheduled
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const StatCard = ({ title, value, change, icon, trend, alert }) => (
    <div className="card" style={{ transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: alert ? '#fef2f2' : '#f8fafc' }}>
                {icon}
            </div>
            {trend === 'up' && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontSize: '0.8rem', gap: '2px' }}><ArrowUp size={14} /> 12%</span>}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>{change}</div>
    </div>
);

const ActivityItem = ({ icon, title, desc, time }) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 0' }}>
        <div style={{
            width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0'
        }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{title}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{desc}</div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', whitespace: 'nowrap' }}>{time}</div>
    </div>
);

const QuickActionBtn = ({ label, icon, color }) => (
    <button className={`btn btn-${color}`} style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem' }}>
        {icon} {label}
    </button>
);

const StatusItem = ({ label, status, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, color: color }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }}></span>
            {status}
        </span>
    </div>
);

const LinkToAll = () => (
    <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
        View All <ArrowRight size={14} />
    </button>
);

export default Dashboard;
