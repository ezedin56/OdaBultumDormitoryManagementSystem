import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/students');
            setStudents(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setLoading(false);
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
