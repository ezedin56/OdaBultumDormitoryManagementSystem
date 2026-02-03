import { useState, useEffect } from 'react';
import { TrendingUp, Users, Building, Wrench, DollarSign, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import axios from 'axios';

const ManagerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/dorms/statistics');
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

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
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'white' }}>Manager Dashboard</h1>
                    <p style={{ opacity: 0.9 }}>
                        System-wide overview • Occupancy: {stats?.rooms?.occupancyRate}% • Active Students: {stats?.students?.assigned}
                    </p>
                </div>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.1)' }} />
                <div style={{ position: 'absolute', bottom: '-40%', right: '20%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)' }} />
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Total Students"
                    value={stats?.students?.total || 0}
                    subtitle={`${stats?.students?.assigned || 0} assigned`}
                    icon={<Users size={24} color="#3b82f6" />}
                    trend="up"
                />
                <StatCard
                    title="Room Occupancy"
                    value={`${stats?.rooms?.occupancyRate || 0}%`}
                    subtitle={`${stats?.rooms?.full || 0}/${stats?.rooms?.total || 0} full`}
                    icon={<Building size={24} color="#ca8a04" />}
                    trend={stats?.rooms?.occupancyRate > 80 ? 'up' : 'down'}
                />
                <StatCard
                    title="Maintenance Requests"
                    value={stats?.maintenance?.total || 0}
                    subtitle={`${stats?.maintenance?.pending || 0} pending`}
                    icon={<Wrench size={24} color="#dc2626" />}
                    alert={stats?.maintenance?.pending > 5}
                />
                <StatCard
                    title="Available Rooms"
                    value={stats?.rooms?.available || 0}
                    subtitle={`${stats?.rooms?.maintenance || 0} under maintenance`}
                    icon={<Activity size={24} color="#10b981" />}
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Occupancy Breakdown */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Occupancy Breakdown</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <MetricBox label="Total Rooms" value={stats?.rooms?.total || 0} color="#3b82f6" />
                            <MetricBox label="Full Rooms" value={stats?.rooms?.full || 0} color="#10b981" />
                            <MetricBox label="Available" value={stats?.rooms?.available || 0} color="#3b82f6" />
                            <MetricBox label="Maintenance" value={stats?.rooms?.maintenance || 0} color="#dc2626" />
                        </div>
                    </div>

                    {/* Student Statistics */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Student Statistics</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ProgressBar
                                label="Assigned Students"
                                value={stats?.students?.assigned || 0}
                                max={stats?.students?.total || 1}
                                color="#3b82f6"
                            />
                            <ProgressBar
                                label="Unassigned Students"
                                value={stats?.students?.unassigned || 0}
                                max={stats?.students?.total || 1}
                                color="#dc2626"
                            />
                        </div>
                    </div>

                    {/* Maintenance Overview */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Maintenance Overview</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <StatusBox label="Pending" value={stats?.maintenance?.pending || 0} color="#fbbf24" />
                            <StatusBox label="In Progress" value={stats?.maintenance?.inProgress || 0} color="#3b82f6" />
                            <StatusBox label="Completed" value={stats?.maintenance?.completed || 0} color="#10b981" />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Quick Summary */}
                    <div className="card" style={{ background: 'linear-gradient(to bottom, #faf5ff, #ffffff)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Quick Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                            <SummaryItem label="Total Capacity" value={`${stats?.rooms?.total * 4 || 0} beds`} />
                            <SummaryItem label="Current Occupancy" value={`${stats?.students?.assigned || 0} students`} />
                            <SummaryItem label="Occupancy Rate" value={`${stats?.rooms?.occupancyRate || 0}%`} />
                            <SummaryItem label="Vacant Beds" value={`${(stats?.rooms?.total * 4) - stats?.students?.assigned || 0} beds`} />
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>System Health</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <HealthItem label="Room Capacity" status={stats?.rooms?.occupancyRate < 90 ? 'Good' : 'Critical'} color={stats?.rooms?.occupancyRate < 90 ? '#10b981' : '#dc2626'} />
                            <HealthItem label="Maintenance Load" status={stats?.maintenance?.pending < 10 ? 'Good' : 'High'} color={stats?.maintenance?.pending < 10 ? '#10b981' : '#fbbf24'} />
                            <HealthItem label="Allocation Rate" status={stats?.students?.unassigned < 50 ? 'Good' : 'Needs Attention'} color={stats?.students?.unassigned < 50 ? '#10b981' : '#fbbf24'} />
                        </div>
                    </div>

                    {/* Financial Overview (Mock) */}
                    <div className="card" style={{ background: '#f0fdf4' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DollarSign size={18} color="#10b981" /> Budget Status
                        </h3>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
                            $125,340
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Remaining budget for maintenance
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const StatCard = ({ title, value, subtitle, icon, trend, alert }) => (
    <div className="card" style={{
        transition: 'transform 0.2s',
        backgroundColor: alert ? '#fef2f2' : 'white',
        borderLeft: alert ? '4px solid #dc2626' : 'none'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f1f5f9' }}>
                {icon}
            </div>
            {trend && (
                <span style={{
                    color: trend === 'up' ? '#10b981' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    gap: '2px'
                }}>
                    {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </span>
            )}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>{subtitle}</div>
    </div>
);

const MetricBox = ({ label, value, color }) => (
    <div style={{
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        borderLeft: `4px solid ${color}`
    }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color, marginBottom: '0.25rem' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{label}</div>
    </div>
);

const ProgressBar = ({ label, value, max, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{label}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: color }}>{value}/{max}</span>
            </div>
            <div style={{
                height: '8px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: color,
                    transition: 'width 1s ease'
                }} />
            </div>
        </div>
    );
};

const StatusBox = ({ label, value, color }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: color,
            marginBottom: '0.25rem'
        }}>
            {value}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{label}</div>
    </div>
);

const SummaryItem = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b' }}>{label}</span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{value}</span>
    </div>
);

const HealthItem = ({ label, status, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{label}</span>
        <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: color
        }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
            {status}
        </span>
    </div>
);

export default ManagerDashboard;
