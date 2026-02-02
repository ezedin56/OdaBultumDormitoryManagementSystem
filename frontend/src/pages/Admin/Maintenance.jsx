import { useState, useEffect } from 'react';
import { Wrench, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const Maintenance = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/maintenance');
            setRequests(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching maintenance requests:', error);
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status.toLowerCase() === filter.toLowerCase();
    });

    const getStatusIcon = (status) => {
        if (status === 'Completed') return <CheckCircle size={18} color="var(--color-success)" />;
        if (status === 'In Progress') return <Clock size={18} color="var(--color-warning)" />;
        return <AlertCircle size={18} color="var(--color-danger)" />;
    };

    const getPriorityColor = (priority) => {
        if (priority === 'Emergency') return 'var(--color-danger)';
        if (priority === 'High') return 'var(--color-warning)';
        return 'var(--text-muted)';
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Wrench /> Maintenance Requests
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track and manage maintenance issues</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'Pending', 'In Progress', 'Completed'].map(f => (
                        <button
                            key={f}
                            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? 'All' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Request List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {filteredRequests.map((req) => (
                    <div key={req._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {getStatusIcon(req.status)}
                                    <h3 style={{ margin: 0 }}>{req.issueType}</h3>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        backgroundColor: getPriorityColor(req.priority),
                                        color: 'white'
                                    }}>
                                        {req.priority}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{req.description}</p>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span>Room: {req.room?.building}-{req.room?.roomNumber}</span> •
                                    <span> Student: {req.student?.fullName}</span> •
                                    <span> {new Date(req.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.85rem',
                                    backgroundColor: req.status === 'Completed' ? 'var(--color-success)' :
                                        req.status === 'In Progress' ? 'var(--color-warning)' :
                                            'var(--color-danger)',
                                    color: 'white'
                                }}>
                                    {req.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredRequests.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No maintenance requests found
                </div>
            )}
        </div>
    );
};

export default Maintenance;
