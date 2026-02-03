import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit, Trash2, ExternalLink, CheckSquare, XSquare } from 'lucide-react';
import axios from 'axios';
import BulkImportAllocation from '../../components/BulkImportAllocation';
import { Link } from 'react-router-dom';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/students');
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = () => {
        console.log('Select All clicked');
        if (selectedStudents.length === filteredStudents.length) {
            console.log('Deselecting all students');
            setSelectedStudents([]);
        } else {
            console.log(`Selecting all ${filteredStudents.length} students`);
            setSelectedStudents(filteredStudents.map(s => s._id));
        }
    };

    const handleClearAll = async () => {
        console.log('Clear All clicked');
        console.log(`Total students to delete: ${students.length}`);
        
        if (!window.confirm(`⚠️ WARNING: This will permanently delete ALL ${students.length} students from the database!\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?`)) {
            console.log('First confirmation cancelled');
            return;
        }

        if (!window.confirm(`🚨 FINAL CONFIRMATION\n\nYou are about to delete ${students.length} students.\n\nType YES in the next prompt to confirm.`)) {
            console.log('Second confirmation cancelled');
            return;
        }

        const confirmation = window.prompt('Type "DELETE ALL" to confirm (case-sensitive):');
        console.log('User typed:', confirmation);
        
        if (confirmation !== 'DELETE ALL') {
            alert('❌ Deletion cancelled. Confirmation text did not match.');
            console.log('Confirmation text did not match');
            return;
        }

        console.log('All confirmations passed, proceeding with deletion...');
        setDeleting(true);
        
        try {
            console.log('Sending DELETE request to /api/students/bulk/all');
            const { data } = await axios.delete('/api/students/bulk/all');
            console.log('Delete response:', data);
            
            alert(`✅ ${data.message}`);
            setStudents([]);
            setSelectedStudents([]);
            await fetchStudents();
        } catch (error) {
            console.error('Error deleting all students:', error);
            alert('❌ Failed to delete students: ' + (error.response?.data?.message || error.message));
        } finally {
            setDeleting(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users /> Students
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage student records</p>
                </div>
                <button className="btn btn-primary" style={{ gap: '0.5rem' }}>
                    <UserPlus size={18} /> Add Student
                </button>
            </div>

            {/* Import & Allocation Section */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <BulkImportAllocation onImportComplete={fetchStudents} onAllocationComplete={fetchStudents} />
            </div>

            {/* Bulk Actions */}
            {students.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)', padding: '1.5rem', backgroundColor: '#f8fafc', border: '2px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <strong style={{ fontSize: '1.1rem' }}>Bulk Actions</strong>
                            <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                📊 Total: <strong>{students.length}</strong> students
                                {selectedStudents.length > 0 && (
                                    <span style={{ marginLeft: '1rem', color: '#3b82f6' }}>
                                        ✓ Selected: <strong>{selectedStudents.length}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleSelectAll}
                                type="button"
                                className="btn btn-secondary"
                                style={{ 
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    pointerEvents: 'auto',
                                    position: 'relative',
                                    zIndex: 10
                                }}
                            >
                                <CheckSquare size={18} />
                                {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <button
                                onClick={handleClearAll}
                                type="button"
                                disabled={deleting}
                                className="btn"
                                style={{ 
                                    gap: '0.5rem',
                                    backgroundColor: deleting ? '#9ca3af' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    cursor: deleting ? 'not-allowed' : 'pointer',
                                    pointerEvents: 'auto',
                                    position: 'relative',
                                    zIndex: 10,
                                    fontWeight: '600'
                                }}
                                onMouseEnter={(e) => !deleting && (e.currentTarget.style.backgroundColor = '#dc2626')}
                                onMouseLeave={(e) => !deleting && (e.currentTarget.style.backgroundColor = '#ef4444')}
                            >
                                <XSquare size={18} />
                                {deleting ? 'Deleting All...' : 'Clear All Students'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="input-field"
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: 'var(--spacing-sm)' }}>Student ID</th>
                            <th style={{ padding: 'var(--spacing-sm)' }}>Full Name</th>
                            <th style={{ padding: 'var(--spacing-sm)' }}>Gender</th>
                            <th style={{ padding: 'var(--spacing-sm)' }}>Department</th>
                            <th style={{ padding: 'var(--spacing-sm)' }}>Year</th>
                            <th style={{ padding: 'var(--spacing-sm)' }}>Room</th>
                            <th style={{ padding: 'var(--spacing-sm)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: 'var(--spacing-sm)' }}>{student.studentId}</td>
                                <td style={{ padding: 'var(--spacing-sm)' }}>{student.fullName}</td>
                                <td style={{ padding: 'var(--spacing-sm)' }}>{student.gender}</td>
                                <td style={{ padding: 'var(--spacing-sm)' }}>{student.department}</td>
                                <td style={{ padding: 'var(--spacing-sm)' }}>Year {student.year}</td>
                                <td style={{ padding: 'var(--spacing-sm)' }}>
                                    {student.room ? `${student.room.building}-${student.room.roomNumber}` : 'Not Assigned'}
                                </td>
                                <td style={{ padding: 'var(--spacing-sm)', display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                                        <Edit size={16} />
                                    </button>
                                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', color: 'var(--color-danger)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                    {/* Preview Portal Button */}
                                    <Link
                                        to={`/student-portal?studentId=${student.studentId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{ padding: '0.25rem 0.5rem', color: '#ca8a04', textDecoration: 'none' }}
                                        title="Preview Student Portal"
                                    >
                                        <ExternalLink size={16} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredStudents.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No students found
                    </div>
                )}
            </div>
        </div>
    );
};

export default Students;
