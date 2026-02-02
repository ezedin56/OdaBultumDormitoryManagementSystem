import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search, Mail, RotateCcw, Phone, ArrowRight, User, Home, MapPin,
    Printer, Download, Share2, Copy, Building, Users, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StudentPortal = () => {
    const [searchParams] = useSearchParams();
    const [studentId, setStudentId] = useState(searchParams.get('studentId') || '');
    const [placement, setPlacement] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault(); // Handle programmatic calls where e is undefined
        if (!studentId) return;

        setError('');
        setPlacement(null);
        setLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/students/lookup', {
                studentId
            });
            // Simulate a slight delay for effect
            setTimeout(() => {
                setPlacement(data);
                setLoading(false);
            }, 800);
        } catch (err) {
            setError(err.response?.data?.message || 'Student not found');
            setLoading(false);
        }
    };

    // Auto-search if coming from URL
    useEffect(() => {
        const urlStudentId = searchParams.get('studentId');
        if (urlStudentId) {
            setStudentId(urlStudentId);
            handleSearch();
        }
    }, [searchParams]);

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <header style={{ backgroundColor: 'white', padding: '1rem 2rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0BAF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        OBU
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', margin: 0 }}>Student Portal</h1>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>Dormitory Placement Viewer</p>
                    </div>
                </div>
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>
                    Login <ArrowRight size={16} />
                </Link>
            </header>

            <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>

                {/* Search Card */}
                {!placement ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '2rem', borderTop: '4px solid #C5A036' }}>
                        <h2 style={{ textAlign: 'center', fontFamily: 'serif', fontSize: '2rem', marginBottom: '0.5rem', color: '#111827' }}>Find Your Dorm Placement</h2>
                        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>Enter your university ID to view your assigned accommodation</p>

                        <form onSubmit={handleSearch}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                    <User size={16} color="#ca8a04" /> University ID
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. UGPR1209/16"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '1rem', outline: 'none' }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: '#C5A036',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'background-color 0.2s',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Searching...' : <><Search size={20} /> View Placement</>}
                            </button>
                        </form>

                        {error && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold' }}>Error:</span> {error}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Detailed Result Card */
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', marginBottom: '2rem', animation: 'fadeIn 0.5s' }}>
                        {/* Header */}
                        <div style={{ backgroundColor: '#0f172a', padding: '1rem 1.5rem', borderBottom: '4px solid #C5A036', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
                            <Building size={24} color="#C5A036" />
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Dormitory Placement Details</h2>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            {/* Hero Section */}
                            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '2rem', textAlign: 'center', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                                <p style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Room</p>
                                <h1 style={{ color: '#ca8a04', fontSize: '3.5rem', fontWeight: '700', lineHeight: 1, marginBottom: '0.5rem' }}>
                                    {placement.room?.roomNumber || 'N/A'}
                                </h1>
                                <p style={{ color: '#0f172a', fontWeight: '600', fontSize: '1.1rem' }}>
                                    {placement.room?.building || 'Unassigned'}
                                </p>
                            </div>

                            {/* Details List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>University ID</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{placement.studentId}</span>
                                        <Copy size={14} color="#64748b" style={{ cursor: 'pointer' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Full Name</span>
                                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{placement.fullName}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Sex</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{placement.gender}</span>
                                        {placement.gender === 'M' ? <span style={{ color: '#3b82f6' }}>♂</span> : <span style={{ color: '#ec4899' }}>♀</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Department</span>
                                    <span style={{
                                        backgroundColor: '#eff6ff',
                                        color: '#3b82f6',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600'
                                    }}>
                                        {placement.department}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Building</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Building size={16} color="#ca8a04" />
                                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{placement.room?.building}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Room Number</span>
                                    <span style={{ fontWeight: '600', color: '#ca8a04', fontSize: '1.1rem' }}>{placement.room?.roomNumber}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Campus</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={16} color="#ca8a04" />
                                        <span style={{ fontWeight: '600', color: '#0f172a' }}>Main Campus</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Capacity</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={16} color="#ca8a04" />
                                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{placement.room?.capacity} Students</span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info Accordion */}
                            <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <span style={{ fontWeight: '500', color: '#0f172a' }}>Additional Information</span>
                                <ChevronDown size={18} color="#64748b" />
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn" style={{
                                    flex: 1,
                                    backgroundColor: '#0f172a',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem'
                                }}>
                                    <Printer size={18} /> Print
                                </button>
                                <button className="btn" style={{
                                    flex: 1,
                                    backgroundColor: '#e2e8f0',
                                    color: '#0f172a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem'
                                }}>
                                    <Download size={18} /> Save PDF
                                </button>
                                <button className="btn" style={{
                                    flex: 1,
                                    backgroundColor: '#e2e8f0',
                                    color: '#0f172a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem'
                                }}>
                                    <Share2 size={18} /> Share
                                </button>
                            </div>

                            <button
                                onClick={() => setPlacement(null)}
                                style={{
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    padding: '0.75rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b7280',
                                    textDecoration: 'underline',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Search Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Issues Section */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ color: '#111827', fontFamily: 'serif', fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#C5A036', border: '1px solid #C5A036', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>?</span>
                        Having Issues?
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                            <Mail size={24} color="#6b7280" />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#1f2937' }}>Contact Proctor</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Email your building proctor</p>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                            <RotateCcw size={24} color="#6b7280" />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#1f2937' }}>Room Change</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Request transfer</p>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #fecaca' }}>
                            <Phone size={24} color="#ef4444" />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#ef4444' }}>Emergency</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f1d1d' }}>Call: +251-911-000-000</p>
                            </div>
                        </div>
                    </div>
                </div>

                <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    &copy; 2024 Oda Bultum University - Dormitory Management System
                </footer>

            </main>
        </div>
    );
};

export default StudentPortal;
