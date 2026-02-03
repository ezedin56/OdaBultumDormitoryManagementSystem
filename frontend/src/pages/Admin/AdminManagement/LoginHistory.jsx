import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const LoginHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        success: '',
        suspicious: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchHistory();
    }, [filters, pagination.page]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/admin/login-history', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: pagination.page,
                    limit: 20,
                    ...filters
                }
            });
            setHistory(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching login history:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={24} />
                    Login History
                </h2>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track all login attempts and sessions</p>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            Status
                        </label>
                        <select
                            value={filters.success}
                            onChange={(e) => setFilters(prev => ({ ...prev, success: e.target.value }))}
                            className="input-field"
                        >
                            <option value="">All</option>
                            <option value="true">Success</option>
                            <option value="false">Failed</option>
                        </select>
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            Suspicious
                        </label>
                        <select
                            value={filters.suspicious}
                            onChange={(e) => setFilters(prev => ({ ...prev, suspicious: e.target.value }))}
                            className="input-field"
                        >
                            <option value="">All</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            className="input-field"
                        />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            className="input-field"
                        />
                    </div>
                    <button
                        onClick={() => setFilters({ success: '', suspicious: '', startDate: '', endDate: '' })}
                        className="btn btn-secondary"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* History Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Loading login history...</div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Timestamp</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Admin</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>IP Address</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Device</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Failure Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((entry, index) => (
                                        <tr 
                                            key={entry._id} 
                                            style={{ 
                                                borderBottom: '1px solid #e2e8f0', 
                                                background: entry.suspicious ? '#fef3c7' : (index % 2 === 0 ? 'white' : '#fafafa')
                                            }}
                                        >
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                {new Date(entry.createdAt).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 600 }}>{entry.admin?.fullName || 'Unknown'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{entry.admin?.email}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {entry.success ? (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        padding: '0.25rem 0.75rem',
                                                        background: '#dcfce7',
                                                        color: '#166534',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}>
                                                        <CheckCircle size={14} />
                                                        Success
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        padding: '0.25rem 0.75rem',
                                                        background: '#fee2e2',
                                                        color: '#991b1b',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}>
                                                        <XCircle size={14} />
                                                        Failed
                                                    </span>
                                                )}
                                                {entry.suspicious && (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        padding: '0.25rem 0.75rem',
                                                        background: '#fef3c7',
                                                        color: '#92400e',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        marginLeft: '0.5rem'
                                                    }}>
                                                        <AlertTriangle size={14} />
                                                        Suspicious
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>
                                                {entry.ipAddress}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                {entry.device || entry.userAgent?.substring(0, 50) || '-'}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#ef4444' }}>
                                                {entry.failureReason || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {history.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                No login history found
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    Showing {history.length} of {pagination.total} entries
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.5rem 1rem' }}
                                    >
                                        Previous
                                    </button>
                                    <span style={{ padding: '0.5rem 1rem', color: '#64748b' }}>
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.pages}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.5rem 1rem' }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginHistory;
