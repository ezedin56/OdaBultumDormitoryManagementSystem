import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search, Mail, RotateCcw, Phone, ArrowRight, User, Home, MapPin,
    Printer, Download, Share2, Copy, Building, Users, ChevronDown, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentPortal = () => {
    const [searchParams] = useSearchParams();
    const [studentId, setStudentId] = useState(searchParams.get('studentId') || '');
    const [placement, setPlacement] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const navigate = useNavigate();

    // Check maintenance mode
    useEffect(() => {
        const checkMaintenanceMode = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/settings');
                if (response.data) {
                    setMaintenanceMode(response.data.maintenanceMode);
                }
            } catch (error) {
                console.error('Error checking maintenance mode:', error);
            }
        };

        checkMaintenanceMode();
        // Check every 30 seconds
        const interval = setInterval(checkMaintenanceMode, 30000);
        return () => clearInterval(interval);
    }, []);

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
            <header style={{ 
                backgroundColor: 'white', 
                padding: '1rem 2rem', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                isolation: 'isolate'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpWVhGUfDQPtwCOjcwTE3tQiAl0obKpwvN1A&s" 
                        alt="OBU Logo" 
                        style={{ 
                            width: '50px', 
                            height: '50px', 
                            objectFit: 'contain',
                            borderRadius: '8px'
                        }} 
                    />
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', margin: 0 }}>Student Portal</h1>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>Dormitory Placement Viewer</p>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Use setTimeout to ensure navigation happens after event handling
                        setTimeout(() => {
                            navigate('/login');
                        }, 0);
                    }}
                    type="button"
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        color: '#6b7280', 
                        fontSize: '0.9rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit',
                        fontWeight: '500',
                        position: 'relative',
                        zIndex: 10,
                        WebkitTapHighlightColor: 'transparent',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        touchAction: 'manipulation',
                        pointerEvents: 'auto'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#C5A036';
                        e.currentTarget.style.color = '#C5A036';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.color = '#6b7280';
                    }}
                >
                    Login <ArrowRight size={16} />
                </button>
            </header>

            {/* Maintenance Mode Banner */}
            {maintenanceMode && (
                <div style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    color: 'white',
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    animation: 'slideDown 0.5s ease-out',
                    textAlign: 'center',
                    flexWrap: 'wrap'
                }}>
                    <AlertTriangle size={32} strokeWidth={2.5} />
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>
                            🔧 SYSTEM UNDER MAINTENANCE
                        </strong>
                        <p style={{ margin: 0, fontSize: '1rem', opacity: 0.95, lineHeight: '1.5' }}>
                            The dormitory management system is currently undergoing maintenance. 
                            Some features may be temporarily unavailable. We apologize for any inconvenience.
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                            For urgent matters, please contact the administration office.
                        </p>
                    </div>
                </div>
            )}

            <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>

                {/* Search Card */}
                {!placement ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '2rem', borderTop: '4px solid #C5A036' }}>
                        <h2 style={{ textAlign: 'center', fontFamily: 'serif', fontSize: '2rem', marginBottom: '0.5rem', color: '#111827' }}>Find Your Dorm Placement</h2>
                        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>Enter your university ID to view your assigned accommodation</p>

                        {/* Maintenance Mode Overlay */}
                        {maintenanceMode && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                border: '2px solid #fca5a5',
                                borderRadius: '12px',
                                padding: '2rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            }}>
                                <AlertTriangle size={48} color="#dc2626" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ 
                                    color: '#dc2626', 
                                    fontSize: '1.3rem', 
                                    fontWeight: '700',
                                    marginBottom: '0.75rem'
                                }}>
                                    Service Temporarily Unavailable
                                </h3>
                                <p style={{ 
                                    color: '#991b1b', 
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    marginBottom: '0.5rem'
                                }}>
                                    The dorm placement lookup service is currently unavailable due to system maintenance.
                                </p>
                                <p style={{ 
                                    color: '#7f1d1d', 
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    Please check back later or contact the administration office for assistance.
                                </p>
                            </div>
                        )}

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
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem 1rem', 
                                        borderRadius: '8px', 
                                        border: '1px solid #d1d5db', 
                                        backgroundColor: maintenanceMode ? '#f3f4f6' : '#f9fafb', 
                                        fontSize: '1rem', 
                                        outline: 'none',
                                        cursor: maintenanceMode ? 'not-allowed' : 'text',
                                        opacity: maintenanceMode ? 0.6 : 1
                                    }}
                                    required
                                    disabled={maintenanceMode}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || maintenanceMode}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: maintenanceMode ? '#9ca3af' : '#C5A036',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: maintenanceMode ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'background-color 0.2s',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    opacity: (loading || maintenanceMode) ? 0.7 : 1,
                                    position: 'relative',
                                    zIndex: 10,
                                    pointerEvents: (loading || maintenanceMode) ? 'none' : 'auto'
                                }}
                                onMouseEnter={(e) => !loading && !maintenanceMode && (e.currentTarget.style.backgroundColor = '#b8932f')}
                                onMouseLeave={(e) => !loading && !maintenanceMode && (e.currentTarget.style.backgroundColor = '#C5A036')}
                            >
                                {maintenanceMode ? (
                                    <>
                                        <AlertTriangle size={20} /> Service Unavailable
                                    </>
                                ) : loading ? (
                                    'Searching...'
                                ) : (
                                    <>
                                        <Search size={20} /> View Placement
                                    </>
                                )}
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

            {/* Animations */}
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default StudentPortal;
