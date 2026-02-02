import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Building, Bed, ArrowRight, TrendingUp, TrendingDown,
    UserPlus, FileText, Calendar, Activity
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        assignedStudents: 0,
        unassignedStudents: 0,
        totalRooms: 0,
        availableRooms: 0,
        fullRooms: 0,
        totalCapacity: 0,
        occupiedBeds: 0,
        occupancyRate: 0,
        blocks: []
    });
    const [recentStudents, setRecentStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch students
            const { data: students } = await axios.get('http://localhost:5000/api/students');
            
            // Fetch rooms
            const { data: rooms } = await axios.get('http://localhost:5000/api/dorms');

            // Calculate statistics
            const assignedStudents = students.filter(s => s.room).length;
            const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
            const occupiedBeds = rooms.reduce((sum, r) => sum + r.occupants.length, 0);
            const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;
            const availableRooms = rooms.filter(r => r.status === 'Available').length;
            const fullRooms = rooms.filter(r => r.status === 'Full').length;

            // Calculate block occupancy
            const blockStats = {};
            rooms.forEach(room => {
                if (!blockStats[room.building]) {
                    blockStats[room.building] = { 
                        capacity: 0, 
                        occupied: 0,
                        gender: room.gender 
                    };
                }
                blockStats[room.building].capacity += room.capacity;
                blockStats[room.building].occupied += room.occupants.length;
            });

            const blocks = Object.keys(blockStats).map(building => ({
                name: building,
                gender: blockStats[building].gender,
                occupancy: blockStats[building].capacity > 0 
                    ? Math.round((blockStats[building].occupied / blockStats[building].capacity) * 100)
                    : 0,
                occupied: blockStats[building].occupied,
                capacity: blockStats[building].capacity
            })).sort((a, b) => a.name.localeCompare(b.name));

            // Get recent students (last 5)
            const recent = students
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setStats({
                totalStudents: students.length,
                assignedStudents,
                unassignedStudents: students.length - assignedStudents,
                totalRooms: rooms.length,
                availableRooms,
                fullRooms,
                totalCapacity,
                occupiedBeds,
                occupancyRate,
                blocks
            });

            setRecentStudents(recent);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading dashboard...</div>
            </div>
        );
    }

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
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'white' }}>Welcome back, Admin</h1>
                        <p style={{ opacity: 0.8, maxWidth: '600px' }}>
                            Here's what's happening across the campus today. You have {stats.unassignedStudents} unassigned students.
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Current Term</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24' }}>Spring 2024</div>
                    </div>
                </div>
                <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.1)' }} />
                <div style={{ position: 'absolute', bottom: '-40%', right: '20%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)' }} />
            </div>

            {/* Main Stats Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    icon={<Users size={24} />}
                    title="Total Students"
                    value={stats.totalStudents}
                    subtitle={`${stats.assignedStudents} assigned`}
                    trend={stats.assignedStudents > 0 ? '+' + Math.round((stats.assignedStudents / stats.totalStudents) * 100) + '%' : '0%'}
                    trendUp={true}
                    color="#3b82f6"
                    onClick={() => navigate('/admin/students')}
                />
                <StatCard
                    icon={<Building size={24} />}
                    title="Total Rooms"
                    value={stats.totalRooms}
                    subtitle={`${stats.availableRooms} available`}
                    trend={stats.fullRooms + ' full'}
                    trendUp={false}
                    color="#8b5cf6"
                    onClick={() => navigate('/admin/dorms')}
                />
                <StatCard
                    icon={<Bed size={24} />}
                    title="Occupancy Rate"
                    value={stats.occupancyRate + '%'}
                    subtitle={`${stats.occupiedBeds}/${stats.totalCapacity} beds`}
                    trend={stats.occupancyRate >= 75 ? 'High' : 'Normal'}
                    trendUp={stats.occupancyRate >= 75}
                    color="#10b981"
                    onClick={() => navigate('/admin/dorms')}
                />
                <StatCard
                    icon={<UserPlus size={24} />}
                    title="Unassigned"
                    value={stats.unassignedStudents}
                    subtitle="Students need rooms"
                    trend={stats.unassignedStudents > 0 ? 'Action needed' : 'All set'}
                    trendUp={false}
                    color="#f59e0b"
                    onClick={() => navigate('/admin/students')}
                />
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={20} /> Quick Actions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <ActionButton
                        icon={<UserPlus size={18} />}
                        label="Add Student"
                        onClick={() => navigate('/admin/students')}
                    />
                    <ActionButton
                        icon={<Building size={18} />}
                        label="Add Block"
                        onClick={() => navigate('/admin/dorms')}
                    />
                    <ActionButton
                        icon={<FileText size={18} />}
                        label="Import Students"
                        onClick={() => navigate('/admin/students')}
                    />
                    <ActionButton
                        icon={<Bed size={18} />}
                        label="Auto-Allocate"
                        onClick={() => navigate('/admin/students')}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Block Occupancy */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Block Occupancy</h3>
                        <button 
                            onClick={() => navigate('/admin/dorms')}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--color-primary)', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.9rem'
                            }}
                        >
                            View All <ArrowRight size={16} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.blocks.map(block => (
                            <BlockOccupancyBar key={block.name} block={block} />
                        ))}
                        {stats.blocks.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No blocks available
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Students */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Recent Students</h3>
                        <button 
                            onClick={() => navigate('/admin/students')}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--color-primary)', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.9rem'
                            }}
                        >
                            View All <ArrowRight size={16} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentStudents.map(student => (
                            <StudentItem key={student._id} student={student} />
                        ))}
                        {recentStudents.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No students yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

// Helper Components
const StatCard = ({ icon, title, value, subtitle, trend, trendUp, color, onClick }) => (
    <div 
        className="card" 
        style={{ 
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            borderLeft: `4px solid ${color}`
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                {icon}
            </div>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                fontSize: '0.85rem',
                color: trendUp ? '#10b981' : '#64748b'
            }}>
                {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {trend}
            </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            {title}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1e293b' }}>
            {value}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {subtitle}
        </div>
    </div>
);

const ActionButton = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="btn btn-secondary"
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            padding: '0.75rem 1rem',
            width: '100%',
            transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-primary)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-main)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
    >
        {icon}
        {label}
    </button>
);

const BlockOccupancyBar = ({ block }) => {
    const genderColor = block.gender === 'M' ? '#3b82f6' : '#ec4899';
    const genderLabel = block.gender === 'M' ? '♂' : '♀';
    
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{block.name}</span>
                    <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: genderColor,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                    }}>
                        {genderLabel}
                    </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {block.occupied}/{block.capacity} ({block.occupancy}%)
                </div>
            </div>
            <div style={{ 
                width: '100%', 
                height: '8px', 
                background: '#e2e8f0', 
                borderRadius: '999px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${block.occupancy}%`,
                    height: '100%',
                    background: block.occupancy >= 90 ? '#dc2626' : 
                               block.occupancy >= 75 ? '#f59e0b' : '#10b981',
                    transition: 'width 0.3s',
                    borderRadius: '999px'
                }}></div>
            </div>
        </div>
    );
};

const StudentItem = ({ student }) => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0.75rem',
        background: '#f8fafc',
        borderRadius: '8px',
        transition: 'background 0.2s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
    onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
    >
        <div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{student.fullName}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {student.studentId} • {student.department}
            </div>
        </div>
        <div>
            {student.room ? (
                <span style={{
                    padding: '0.25rem 0.75rem',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                }}>
                    Assigned
                </span>
            ) : (
                <span style={{
                    padding: '0.25rem 0.75rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                }}>
                    Unassigned
                </span>
            )}
        </div>
    </div>
);

export default Dashboard;
