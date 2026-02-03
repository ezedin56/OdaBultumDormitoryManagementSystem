import { useState, useEffect } from 'react';
import { Activity, Filter } from 'lucide-react';
import axios from 'axios';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        actionType: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchLogs();
    }, [filters, pagination.page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/admin/activity-logs', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: pagination.page,
                    limit: 20,
                    ...filters
                }
            });
            setLogs(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (actionType) => {
        const colors = {
            ADMIN_CREATED: { bg: '#dcfce7', color: '#166534' },
            ADMIN_UPDATED: { bg: '#dbeafe', color: '#1e40af' },
            ADMIN_DELETED: { bg: '#fee2e2', color: '#991b1b' },
            ADMIN_SUSPENDED: { bg: '#fef3c7', color: '#92400e' },
            ADMIN_ACTIVATED: { bg: '#dcfce7', color: '#166534' },
            LOGIN_SUCCESS: { bg: '#dcfce7', color: '#166534' },
            LOGIN_FAILED: { bg: '#fee2e2', color: '#991b1b' },
            PASSWORD_RESET: { bg: '#fef3c7', color: '#92400e' }
        };
        const style = colors[actionType] || { bg: '#f1f5f9', color: '#475569' };
        
        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                background: style.bg,
                color: style.color,
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600
            }}>
                {actionType.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={24} />
                    Activity Logs
                </h2>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track all administrative actions</p>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            Action Type
                        </label>
                        <select
                            value={filters.actionType}
                            onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
                            className="input-field"
                        >
                            <option value="">All Actions</option>
                            <option value="ADMIN_CREATED">Admin Created</option>
                            <option value="ADMIN_UPDATED">Admin Updated</option>
                            <option value="ADMIN_DELETED">Admin Deleted</option>
                            <option value="ADMIN_SUSPENDED">Admin Suspended</option>
                            <option value="ADMIN_ACTIVATED">Admin Activated</option>
                            <option value="LOGIN_SUCCESS">Login Success</option>
                            <option value="LOGIN_FAILED">Login Failed</option>
                            <option value="PASSWORD_RESET">Password Reset</option>
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
                        onClick={() => setFilters({ actionType: '', startDate: '', endDate: '' })}
                        className="btn btn-secondary"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Loading logs...</div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Timestamp</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Action</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Performed By</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Description</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={log._id} style={{ borderBottom: '1px solid #e2e8f0', background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>{getActionBadge(log.actionType)}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 600 }}>{log.performedBy?.fullName || 'System'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.performedBy?.email}</div>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#475569' }}>{log.description}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>
                                                {log.ipAddress || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {logs.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                No activity logs found
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    Showing {logs.length} of {pagination.total} logs
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

export default ActivityLogs;
