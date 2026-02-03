import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search, Mail, RotateCcw, Phone, User, Home, MapPin,
    Download, Copy, Building, Users, AlertTriangle, Printer, Share2, ChevronDown
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
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
            {/* Header - Fixed */}
            <header style={{ 
                background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
                padding: '1rem 2rem', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpWVhGUfDQPtwCOjcwTE3tQiAl0obKpwvN1A&s" 
                        alt="OBU Logo" 
                        style={{ 
                            width: '45px', 
                            height: '45px', 
                            objectFit: 'contain',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            padding: '4px'
                        }} 
                    />
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', margin: 0 }}>Oda Bultum University</h1>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>Dormitory Management System</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '0.9rem' }}>
                        <Mail size={16} />
                        <span>info@obu.edu.et</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '0.9rem' }}>
                        <Phone size={16} />
                        <span>+251-25-551-1234</span>
                    </div>
                </div>
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
                    flexWrap: 'wrap',
                    position: 'fixed',
                    top: '80px',
                    left: 0,
                    right: 0,
                    zIndex: 999
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

            <main style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '2rem 1.5rem',
                paddingTop: maintenanceMode ? 'calc(80px + 180px + 2rem)' : 'calc(80px + 2rem)',
                paddingBottom: 'calc(60px + 2rem)',
                overflow: 'auto',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
                minHeight: '100vh'
            }}>
                <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>

                {/* Search Card - Modern Redesign */}
                {!placement ? (
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '24px', 
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        maxWidth: '650px',
                        border: '1px solid rgba(16, 185, 129, 0.1)'
                    }}>
                        {/* Gradient Header with Logo */}
                        <div className="search-header" style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            padding: '3rem 2.5rem',
                            color: 'white',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative circles */}
                            <div style={{
                                position: 'absolute',
                                top: '-50px',
                                right: '-50px',
                                width: '200px',
                                height: '200px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%'
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                bottom: '-30px',
                                left: '-30px',
                                width: '150px',
                                height: '150px',
                                background: 'rgba(255,255,255,0.08)',
                                borderRadius: '50%'
                            }}></div>
                            
                            {/* University Logo */}
                            <div style={{
                                width: '100px',
                                height: '100px',
                                background: 'white',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                border: '4px solid rgba(255,255,255,0.3)',
                                position: 'relative',
                                zIndex: 1,
                                padding: '0.5rem'
                            }}>
                                <img 
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpWVhGUfDQPtwCOjcwTE3tQiAl0obKpwvN1A&s" 
                                    alt="OBU Logo" 
                                    style={{ 
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }} 
                                />
                            </div>
                            
                            <h2 style={{ 
                                margin: 0, 
                                fontSize: '2rem', 
                                fontWeight: '800',
                                marginBottom: '0.75rem',
                                lineHeight: '1.2',
                                position: 'relative',
                                zIndex: 1
                            }}>Find Your Dorm</h2>
                            <p style={{ 
                                margin: 0,
                                fontSize: '1.05rem',
                                opacity: 0.95,
                                lineHeight: '1.6',
                                position: 'relative',
                                zIndex: 1
                            }}>Enter your university ID to view your Dorm assignment</p>
                        </div>

                        {/* Form Content with Modern Design */}
                        <div className="search-form-content" style={{ padding: '3rem 2.5rem' }}>

                        {/* Maintenance Mode Overlay */}
                        {maintenanceMode && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                border: '2px solid #fca5a5',
                                borderRadius: '16px',
                                padding: '2rem',
                                marginBottom: '2rem',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: '#fee2e2',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem'
                                }}>
                                    <AlertTriangle size={32} color="#dc2626" />
                                </div>
                                <h3 style={{ 
                                    color: '#dc2626', 
                                    fontSize: '1.25rem', 
                                    fontWeight: '700',
                                    marginBottom: '0.75rem'
                                }}>
                                    Service Temporarily Unavailable
                                </h3>
                                <p style={{ 
                                    color: '#991b1b', 
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    marginBottom: '0.5rem'
                                }}>
                                    The dorm placement lookup service is currently unavailable due to system maintenance.
                                </p>
                                <p style={{ 
                                    color: '#7f1d1d', 
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    Please check back later or contact the administration office.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSearch}>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ 
                                    display: 'block',
                                    fontSize: '0.95rem', 
                                    fontWeight: '600', 
                                    color: '#374151', 
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <User size={18} color="white" />
                                    </div>
                                    University ID Number
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="e.g., UGPR1209/16"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        className="search-input"
                                        style={{ 
                                            width: '100%', 
                                            padding: '1.25rem 1.25rem 1.25rem 3.5rem', 
                                            borderRadius: '14px', 
                                            border: '2px solid #e5e7eb', 
                                            backgroundColor: maintenanceMode ? '#f9fafb' : 'white', 
                                            fontSize: '1.1rem', 
                                            outline: 'none',
                                            cursor: maintenanceMode ? 'not-allowed' : 'text',
                                            opacity: maintenanceMode ? 0.6 : 1,
                                            transition: 'all 0.3s',
                                            fontWeight: '500',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#10b981';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                        }}
                                        required
                                        disabled={maintenanceMode}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        left: '1.25rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#9ca3af',
                                        pointerEvents: 'none'
                                    }}>
                                        <Search size={20} />
                                    </div>
                                </div>
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: '#6b7280',
                                    marginTop: '0.5rem',
                                    marginLeft: '0.25rem'
                                }}>
                                    Enter your complete university ID as shown on your ID card
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || maintenanceMode}
                                className="search-button"
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    background: maintenanceMode ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: maintenanceMode ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.3s',
                                    opacity: (loading || maintenanceMode) ? 0.7 : 1,
                                    boxShadow: maintenanceMode ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.4)',
                                    transform: 'translateY(0)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading && !maintenanceMode) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading && !maintenanceMode) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
                                    }
                                }}
                            >
                                {maintenanceMode ? (
                                    <>
                                        <AlertTriangle size={24} /> Service Unavailable
                                    </>
                                ) : loading ? (
                                    <>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '3px solid rgba(255,255,255,0.3)',
                                            borderTop: '3px solid white',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite'
                                        }}></div>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search size={24} /> View Placement
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div style={{ 
                                marginTop: '1.5rem', 
                                padding: '1rem 1.25rem', 
                                backgroundColor: '#fef2f2', 
                                color: '#dc2626', 
                                borderRadius: '12px', 
                                borderLeft: '4px solid #dc2626', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem', 
                                fontSize: '0.95rem',
                                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)'
                            }}>
                                <AlertTriangle size={20} />
                                <div>
                                    <span style={{ fontWeight: '700' }}>Error:</span> {error}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                ) : (
                    /* Student Placement Result - Modern Card Design */
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '24px', 
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
                        overflow: 'visible',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        maxWidth: '1000px',
                        border: '1px solid rgba(16, 185, 129, 0.1)',
                        marginBottom: '2rem'
                    }}>
                        {/* Header with Gradient */}
                        <div className="placement-header" style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            padding: '1.5rem 2rem',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative elements */}
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%'
                            }}></div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <Building size={26} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Your Room Assignment</h2>
                                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.95 }}>Dormitory Placement Details</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPlacement(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    color: 'white',
                                    padding: '0.65rem 1.5rem',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s',
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            >
                                <RotateCcw size={16} /> New Search
                            </button>
                        </div>

                        {/* Content - Modern Card Layout */}
                        <div className="placement-content" style={{ 
                            padding: '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2rem'
                        }}>
                            {/* Room Number - Large Featured Card */}
                            <div className="room-featured-card" style={{ 
                                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                borderRadius: '20px',
                                padding: '2.5rem',
                                textAlign: 'center',
                                border: '2px solid #fbbf24',
                                boxShadow: '0 8px 24px rgba(251, 191, 36, 0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Decorative elements */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-30px',
                                    right: '-30px',
                                    width: '120px',
                                    height: '120px',
                                    background: 'rgba(251, 191, 36, 0.15)',
                                    borderRadius: '50%'
                                }}></div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-20px',
                                    left: '-20px',
                                    width: '100px',
                                    height: '100px',
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    borderRadius: '50%'
                                }}></div>
                                
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: 'rgba(180, 83, 9, 0.1)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '999px',
                                        marginBottom: '1rem'
                                    }}>
                                        <Home size={16} color="#92400e" />
                                        <span style={{ 
                                            color: '#92400e',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}>Your Assigned Room</span>
                                    </div>
                                    <h1 style={{ 
                                        fontSize: '5rem',
                                        fontWeight: '900',
                                        color: '#b45309',
                                        margin: '0.5rem 0',
                                        lineHeight: 1,
                                        textShadow: '0 2px 4px rgba(180, 83, 9, 0.1)'
                                    }}>
                                        {placement.room?.roomNumber || 'N/A'}
                                    </h1>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        background: 'rgba(180, 83, 9, 0.1)',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '12px',
                                        marginTop: '1rem'
                                    }}>
                                        <Building size={20} color="#92400e" />
                                        <p style={{ 
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            color: '#92400e',
                                            margin: 0
                                        }}>
                                            {placement.room?.building || 'Unassigned'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Student Details - Modern Grid with Consistent Colors */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '1.25rem'
                            }}>
                                {/* University ID */}
                                <div className="detail-card" style={{
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    borderRadius: '16px',
                                    border: '1px solid #bfdbfe',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            background: '#3b82f6',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <User size={20} color="white" />
                                        </div>
                                        <p style={{ 
                                            color: '#1e40af',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            margin: 0
                                        }}>University ID</p>
                                    </div>
                                    <p style={{ 
                                        fontSize: '1.15rem',
                                        fontWeight: '700',
                                        color: '#1e3a8a',
                                        margin: 0
                                    }}>{placement.studentId}</p>
                                </div>

                                {/* Full Name */}
                                <div className="detail-card" style={{
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    borderRadius: '16px',
                                    border: '1px solid #bfdbfe',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            background: '#3b82f6',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <User size={20} color="white" />
                                        </div>
                                        <p style={{ 
                                            color: '#1e40af',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            margin: 0
                                        }}>Full Name</p>
                                    </div>
                                    <p style={{ 
                                        fontSize: '1.15rem',
                                        fontWeight: '700',
                                        color: '#1e3a8a',
                                        margin: 0
                                    }}>{placement.fullName}</p>
                                </div>

                                {/* Gender */}
                                <div className="detail-card" style={{
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    borderRadius: '16px',
                                    border: '1px solid #bfdbfe',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            background: '#3b82f6',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem'
                                        }}>
                                            {placement.gender === 'M' ? '♂' : '♀'}
                                        </div>
                                        <p style={{ 
                                            color: '#1e40af',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            margin: 0
                                        }}>Gender</p>
                                    </div>
                                    <p style={{ 
                                        fontSize: '1.15rem',
                                        fontWeight: '700',
                                        color: '#1e3a8a',
                                        margin: 0
                                    }}>{placement.gender === 'M' ? 'Male' : 'Female'}</p>
                                </div>

                                {/* Department */}
                                <div className="detail-card" style={{
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    borderRadius: '16px',
                                    border: '1px solid #bfdbfe',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            background: '#3b82f6',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Building size={20} color="white" />
                                        </div>
                                        <p style={{ 
                                            color: '#1e40af',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            margin: 0
                                        }}>Department</p>
                                    </div>
                                    <p style={{ 
                                        fontSize: '1.15rem',
                                        fontWeight: '700',
                                        color: '#1e3a8a',
                                        margin: 0
                                    }}>{placement.department}</p>
                                </div>

                                {/* Campus */}
                                <div className="detail-card" style={{
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    borderRadius: '16px',
                                    border: '1px solid #bfdbfe',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            background: '#3b82f6',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <MapPin size={20} color="white" />
                                        </div>
                                        <p style={{ 
                                            color: '#1e40af',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            margin: 0
                                        }}>Campus</p>
                                    </div>
                                    <p style={{ 
                                        fontSize: '1.15rem',
                                        fontWeight: '700',
                                        color: '#1e3a8a',
                                        margin: 0
                                    }}>Main Campus</p>
                                </div>

                                {/* Room Capacity */}
                                <div className="detail-card" style={{
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    borderRadius: '16px',
                                    border: '1px solid #bfdbfe',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            background: '#3b82f6',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Users size={20} color="white" />
                                        </div>
                                        <p style={{ 
                                            color: '#1e40af',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            margin: 0
                                        }}>Room Capacity</p>
                                    </div>
                                    <p style={{ 
                                        fontSize: '1.15rem',
                                        fontWeight: '700',
                                        color: '#1e3a8a',
                                        margin: 0
                                    }}>{placement.room?.capacity} Students</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ 
                            padding: '1.5rem 2.5rem 2.5rem',
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => {
                                    const printWindow = window.open('', '', 'height=800,width=800');
                                    const htmlContent = `
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                            <title>Dormitory Placement - ${placement.studentId}</title>
                                            <style>
                                                body { font-family: Arial, sans-serif; padding: 40px; }
                                                .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #10b981; padding-bottom: 20px; }
                                                .header h1 { color: #10b981; margin: 0; font-size: 28px; }
                                                .room-box { background: #fef3c7; border: 2px solid #fbbf24; padding: 30px; text-align: center; margin: 20px 0; border-radius: 10px; }
                                                .room-number { font-size: 48px; color: #b45309; font-weight: bold; margin: 10px 0; }
                                                .info-row { display: flex; padding: 12px 15px; border-bottom: 1px solid #eee; }
                                                .info-label { font-weight: bold; width: 180px; color: #666; }
                                                .info-value { color: #333; flex: 1; }
                                                .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
                                            </style>
                                        </head>
                                        <body>
                                            <div class="header">
                                                <h1>DORMITORY PLACEMENT DETAILS</h1>
                                                <h2 style="color: #666; margin: 5px 0; font-size: 18px;">Oda Bultum University</h2>
                                            </div>
                                            <div class="room-box">
                                                <div style="color: #92400e; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">YOUR ASSIGNED ROOM</div>
                                                <div class="room-number">${placement.room?.roomNumber || 'N/A'}</div>
                                                <div style="font-size: 24px; color: #92400e; font-weight: bold;">${placement.room?.building || 'Unassigned'}</div>
                                            </div>
                                            <div style="margin: 30px 0;">
                                                <div class="info-row">
                                                    <div class="info-label">University ID:</div>
                                                    <div class="info-value">${placement.studentId}</div>
                                                </div>
                                                <div class="info-row">
                                                    <div class="info-label">Full Name:</div>
                                                    <div class="info-value">${placement.fullName}</div>
                                                </div>
                                                <div class="info-row">
                                                    <div class="info-label">Gender:</div>
                                                    <div class="info-value">${placement.gender === 'M' ? 'Male' : 'Female'}</div>
                                                </div>
                                                <div class="info-row">
                                                    <div class="info-label">Department:</div>
                                                    <div class="info-value">${placement.department}</div>
                                                </div>
                                                <div class="info-row">
                                                    <div class="info-label">Campus:</div>
                                                    <div class="info-value">Main Campus</div>
                                                </div>
                                                <div class="info-row">
                                                    <div class="info-label">Room Capacity:</div>
                                                    <div class="info-value">${placement.room?.capacity || 'N/A'} Students</div>
                                                </div>
                                            </div>
                                            <div class="footer">
                                                <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                                                <p>© 2026 Oda Bultum University - Dormitory Management System</p>
                                            </div>
                                        </body>
                                        </html>
                                    `;
                                    printWindow.document.write(htmlContent);
                                    printWindow.document.close();
                                    setTimeout(() => {
                                        printWindow.print();
                                        setTimeout(() => printWindow.close(), 100);
                                    }, 250);
                                }}
                                className="download-button"
                                style={{
                                    flex: 1,
                                    minWidth: '200px',
                                    padding: '1rem 2rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
                                }}
                            >
                                <Download size={20} />
                                Download PDF
                            </button>
                            
                            <button
                                onClick={() => {
                                    const text = `Room Assignment - ${placement.studentId}\nRoom: ${placement.room?.roomNumber || 'N/A'}\nBuilding: ${placement.room?.building || 'Unassigned'}`;
                                    navigator.clipboard.writeText(text);
                                    alert('Room details copied to clipboard!');
                                }}
                                style={{
                                    flex: 1,
                                    minWidth: '200px',
                                    padding: '1rem 2rem',
                                    background: 'white',
                                    color: '#10b981',
                                    border: '2px solid #10b981',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f0fdf4';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <Copy size={20} />
                                Copy Details
                            </button>
                        </div>
                    </div>
                )}
                </div>

            </main>

            {/* Footer - Fixed */}
            <footer style={{ 
                backgroundColor: '#000000', 
                color: 'white', 
                textAlign: 'center', 
                padding: '1rem 2rem',
                fontSize: '0.9rem',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000
            }}>
                Copyright © 2026 Oda Bultum University. All rights reserved.
            </footer>

            {/* Animations and Responsive Styles */}
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

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                /* Hover effects for detail cards */
                .detail-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                }

                /* Responsive Styles */
                @media (max-width: 1024px) {
                    /* Tablet landscape */
                    header {
                        padding: 0.75rem 1.5rem !important;
                    }
                    header h1 {
                        font-size: 1rem !important;
                    }
                    header p {
                        font-size: 0.75rem !important;
                    }
                    header > div:last-child {
                        gap: 1rem !important;
                    }
                    header > div:last-child > div {
                        font-size: 0.8rem !important;
                    }
                    main {
                        padding-top: calc(70px + 2rem) !important;
                    }
                }

                @media (max-width: 768px) {
                    /* Tablet portrait and mobile landscape */
                    header {
                        flex-direction: column !important;
                        gap: 1rem !important;
                        padding: 1rem !important;
                    }
                    header > div:first-child {
                        justify-content: center !important;
                    }
                    header > div:last-child {
                        flex-direction: column !important;
                        gap: 0.5rem !important;
                        width: 100% !important;
                    }
                    
                    main {
                        padding-top: calc(140px + 2rem) !important;
                    }
                    
                    /* Placement result - stack layout */
                    .placement-content {
                        padding: 1.5rem !important;
                    }
                    
                    .room-featured-card h1 {
                        font-size: 4rem !important;
                    }
                }

                @media (max-width: 640px) {
                    /* Mobile */
                    main {
                        padding: 1rem !important;
                        padding-top: calc(140px + 1rem) !important;
                        padding-bottom: calc(60px + 1rem) !important;
                        min-height: auto !important;
                        align-items: flex-start !important;
                    }
                    
                    /* Search form responsive */
                    .search-header {
                        padding: 2rem 1.5rem !important;
                    }
                    .search-header > div:first-of-type {
                        width: 80px !important;
                        height: 80px !important;
                    }
                    .search-header h2 {
                        font-size: 1.5rem !important;
                    }
                    .search-header p {
                        font-size: 0.95rem !important;
                    }
                    .search-form-content {
                        padding: 2rem 1.5rem !important;
                    }
                    .search-input {
                        padding: 1rem 1rem 1rem 3rem !important;
                        font-size: 1rem !important;
                    }
                    .search-button {
                        padding: 1rem !important;
                        font-size: 1rem !important;
                    }
                    
                    /* Placement header responsive */
                    .placement-header {
                        flex-direction: column !important;
                        gap: 1rem !important;
                        padding: 1rem 1.5rem !important;
                    }
                    .placement-header h2 {
                        font-size: 1.2rem !important;
                    }
                    .placement-header p {
                        font-size: 0.75rem !important;
                    }
                    
                    /* Room featured card responsive */
                    .room-featured-card {
                        padding: 2rem 1.5rem !important;
                    }
                    .room-featured-card h1 {
                        font-size: 3.5rem !important;
                    }
                    
                    /* Detail cards responsive */
                    .detail-card {
                        padding: 1.25rem !important;
                    }
                    
                    /* Download buttons responsive */
                    .download-button {
                        padding: 1rem 1.5rem !important;
                        font-size: 0.95rem !important;
                    }
                    
                    footer {
                        padding: 1rem !important;
                        font-size: 0.8rem !important;
                    }
                }

                @media (max-width: 480px) {
                    /* Small mobile */
                    .search-header h2 {
                        font-size: 1.25rem !important;
                    }
                    .search-header p {
                        font-size: 0.85rem !important;
                    }
                    .room-featured-card h1 {
                        font-size: 3rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default StudentPortal;
