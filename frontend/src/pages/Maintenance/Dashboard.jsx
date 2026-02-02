import { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import axios from 'axios';

const MaintenanceDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // Mock user ID - in real app, get from auth context
    const userId = '507f1f77bcf86cd799439011';

    useEffect(() => {
        fetchStats();
        fetchMyRequests();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/maintenance/stats?userId=${userId}`);
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchMyRequests = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/maintenance/my-requests?userId=${userId}`);
            setRequests(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setLoading(false);
        }
    };

    const filteredRequests = filter === 'all'
        ? requests
        : requests.filter(r => r.priority?.toLowerCase() === filter.toLowerCase());

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                marginBottom: '2rem',
                boxShadow: '0 10px 15px -3px rgba(234, 88, 12, 0.3)'
            }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'white' }}>Maintenance Dashboard</h1>
                <p style={{ opacity: 0.9 }}>
                    You have {stats.pending} pending tasks and {stats.inProgress} in progress
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard title="Total Tasks" value={stats.total} icon={<Wrench size={24} color="#ea580c" />} />
                <StatCard title="Pending" value={stats.pending} icon={<Clock size={24} color="#dc2626" />} alert />
                <StatCard title="In Progress" value={stats.inProgress} icon={<AlertCircle size={24} color="#ca8a04" />} />
                <StatCard title="Completed Today" value={stats.completed} icon={<CheckCircle2 size={24} color="#10b981" />} />
            </div>

            {/* Task List */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Filter size={20} /> My Tasks
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <FilterBtn label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                        <FilterBtn label="High" active={filter === 'high'} onClick={() => setFilter('high')} color="#dc2626" />
                        <FilterBtn label="Medium" active={filter === 'medium'} onClick={() => setFilter('medium')} color="#ca8a04" />
                        <FilterBtn label="Low" active={filter === 'low'} onClick={() => setFilter('low')} color="#10b981" />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No tasks found
                        </div>
                    ) : (
                        filteredRequests.map((request) => (
                            <TaskItem key={request._id} request={request} onUpdate={fetchMyRequests} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, alert }) => (
    <div className="card" style={{
        transition: 'transform 0.2s',
        backgroundColor: alert ? '#fef2f2' : 'white',
        borderLeft: alert ? '4px solid #dc2626' : 'none'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fef3c7' }}>
                {icon}
            </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{title}</div>
    </div>
);

const FilterBtn = ({ label, active, onClick, color }) => (
    <button
        onClick={onClick}
        className="btn btn-secondary"
        style={{
            padding: '0.25rem 0.75rem',
            fontSize: '0.8rem',
            backgroundColor: active ? (color || '#ea580c') : 'transparent',
            color: active ? 'white' : (color || '#64748b'),
            border: `1px solid ${active ? (color || '#ea580c') : '#e2e8f0'}`
        }}
    >
        {label}
    </button>
);

const TaskItem = ({ request, onUpdate }) => {
    const [updating, setUpdating] = useState(false);

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#dc2626';
            case 'medium': return '#ca8a04';
            case 'low': return '#10b981';
            default: return '#64748b';
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            await axios.put(`http://localhost:5000/api/maintenance/${request._id}`, {
                status: newStatus
            });
            onUpdate();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div style={{
            padding: '1rem',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{request.issueType}</span>
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: getPriorityColor(request.priority) + '20',
                            color: getPriorityColor(request.priority),
                            fontWeight: 600
                        }}>
                            {request.priority}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        {request.description}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Room: {request.room?.building}-{request.room?.roomNumber} • Student: {request.student?.fullName}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {request.status !== 'Completed' && (
                        <>
                            {request.status === 'Pending' && (
                                <button
                                    onClick={() => handleStatusUpdate('In Progress')}
                                    className="btn btn-primary"
                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', backgroundColor: '#ea580c' }}
                                    disabled={updating}
                                >
                                    Start
                                </button>
                            )}
                            {request.status === 'In Progress' && (
                                <button
                                    onClick={() => handleStatusUpdate('Completed')}
                                    className="btn btn-success"
                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                    disabled={updating}
                                >
                                    Complete
                                </button>
                            )}
                        </>
                    )}
                    {request.status === 'Completed' && (
                        <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>✓ Done</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaintenanceDashboard;
