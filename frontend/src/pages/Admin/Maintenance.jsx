import { useState, useEffect } from 'react';
import { Wrench, AlertCircle, CheckCircle, Clock, UserPlus, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';

const Maintenance = () => {
    const [requests, setRequests] = useState([]);
    const [maintenanceStaff, setMaintenanceStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [assignedStaff, setAssignedStaff] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchRequests();
        fetchMaintenanceStaff();
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

    const fetchMaintenanceStaff = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/auth/users?role=maintenance');
            setMaintenanceStaff(data);
        } catch (error) {
            console.error('Error fetching maintenance staff:', error);
        }
    };

    const handleAssign = async () => {
        if (!assignedStaff) {
            alert('Please select a staff member');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/maintenance/${selectedRequest._id}`, {
                assignedTo: assignedStaff,
                status: 'In Progress',
                comment: 'Assigned to maintenance staff',
                updatedBy: 'Admin'
            });
            
            setShowAssignModal(false);
            setAssignedStaff('');
            fetchRequests();
            alert('Staff assigned successfully!');
        } catch (error) {
            console.error('Error assigning staff:', error);
            alert('Failed to assign staff');
        }
    };

    const handleUpdateStatus = async () => {
        if (!newStatus) {
            alert('Please select a status');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/maintenance/${selectedRequest._id}`, {
                status: newStatus,
                comment: comment || `Status updated to ${newStatus}`,
                updatedBy: 'Admin'
            });
            
            setShowEditModal(false);
            setNewStatus('');
            setComment('');
            fetchRequests();
            alert('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this request?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/maintenance/${id}`);
            fetchRequests();
            alert('Request deleted successfully!');
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('Failed to delete request');
        }
    };

    const openAssignModal = (request) => {
        setSelectedRequest(request);
        setAssignedStaff(request.assignedTo?._id || '');
        setShowAssignModal(true);
    };

    const openEditModal = (request) => {
        setSelectedRequest(request);
        setNewStatus(request.status);
        setComment('');
        setShowEditModal(true);
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

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--color-danger)' }}>{requests.filter(r => r.status === 'Pending').length}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--color-warning)' }}>{requests.filter(r => r.status === 'In Progress').length}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>In Progress</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--color-success)' }}>{requests.filter(r => r.status === 'Completed').length}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Completed</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3>{requests.length}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
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
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    <span>Room: {req.room?.building}-{req.room?.roomNumber}</span> •
                                    <span> Student: {req.student?.fullName}</span> •
                                    <span> {new Date(req.createdAt).toLocaleDateString()}</span>
                                </div>
                                {req.assignedTo && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                                        Assigned to: {req.assignedTo.username}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
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
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        className="btn btn-secondary" 
                                        style={{ padding: '0.25rem 0.5rem' }}
                                        onClick={() => openAssignModal(req)}
                                        title="Assign Staff"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                    <button 
                                        className="btn btn-secondary" 
                                        style={{ padding: '0.25rem 0.5rem' }}
                                        onClick={() => openEditModal(req)}
                                        title="Update Status"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        className="btn btn-secondary" 
                                        style={{ padding: '0.25rem 0.5rem', color: 'var(--color-danger)' }}
                                        onClick={() => handleDelete(req._id)}
                                        title="Delete Request"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
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

            {/* Assign Staff Modal */}
            {showAssignModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button 
                            onClick={() => setShowAssignModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>
                        <h2 style={{ marginBottom: '1rem' }}>Assign Maintenance Staff</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Issue: {selectedRequest?.issueType} - {selectedRequest?.room?.building}-{selectedRequest?.room?.roomNumber}
                        </p>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Select Staff Member
                            </label>
                            <select 
                                className="input-field"
                                value={assignedStaff}
                                onChange={(e) => setAssignedStaff(e.target.value)}
                            >
                                <option value="">-- Select Staff --</option>
                                {maintenanceStaff.map(staff => (
                                    <option key={staff._id} value={staff._id}>
                                        {staff.username} ({staff.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleAssign}>
                                Assign Staff
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Modal */}
            {showEditModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button 
                            onClick={() => setShowEditModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>
                        <h2 style={{ marginBottom: '1rem' }}>Update Request Status</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Issue: {selectedRequest?.issueType} - {selectedRequest?.room?.building}-{selectedRequest?.room?.roomNumber}
                        </p>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Status
                            </label>
                            <select 
                                className="input-field"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Comment (Optional)
                            </label>
                            <textarea 
                                className="input-field"
                                rows="3"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment about this update..."
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleUpdateStatus}>
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
