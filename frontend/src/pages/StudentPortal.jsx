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
        <div style={{ backgroundColor: '#f3f4f6', height: '100vh', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <header style={{ 
                background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
                padding: '1rem 2rem', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexShrink: 0,
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

            <main style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '2rem 1.5rem',
                overflow: 'hidden'
            }}>
                <div style={{ width: '100%', maxWidth: '680px', height: '100%', display: 'flex', alignItems: 'center' }}>

                {/* Search Card */}
                {!placement ? (
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '16px', 
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%'
                    }}>
                        {/* Green Header */}
                        <div className="search-header" style={{ 
                            background: '#10b981',
                            padding: '3.5rem 2.5rem',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            <h2 style={{ 
                                margin: 0, 
                                fontSize: '2.25rem', 
                                fontWeight: '700',
                                marginBottom: '1.5rem',
                                lineHeight: '1.2'
                            }}>Find Your Dorm Placement</h2>
                            <p style={{ 
                                margin: 0,
                                fontSize: '1.15rem',
                                opacity: 0.95,
                                lineHeight: '1.7'
                            }}>Enter your university ID to view your assigned accommodation</p>
                        </div>

                        {/* Form Content */}
                        <div className="search-form-content" style={{ padding: '5rem 3.5rem' }}>

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
                            <div style={{ marginBottom: '3.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '1.5rem' }}>
                                    <User size={24} color="#10b981" /> University ID
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. UGPR1209/16"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="search-input"
                                    style={{ 
                                        width: '100%', 
                                        padding: '1.75rem 1.75rem', 
                                        borderRadius: '12px', 
                                        border: '2px solid #d1d5db', 
                                        backgroundColor: maintenanceMode ? '#f3f4f6' : '#f9fafb', 
                                        fontSize: '1.25rem', 
                                        outline: 'none',
                                        cursor: maintenanceMode ? 'not-allowed' : 'text',
                                        opacity: maintenanceMode ? 0.6 : 1,
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    required
                                    disabled={maintenanceMode}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || maintenanceMode}
                                className="search-button"
                                style={{
                                    width: '100%',
                                    padding: '2rem',
                                    backgroundColor: maintenanceMode ? '#9ca3af' : '#C5A036',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    cursor: maintenanceMode ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.85rem',
                                    transition: 'all 0.2s',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    opacity: (loading || maintenanceMode) ? 0.7 : 1,
                                    position: 'relative',
                                    zIndex: 10,
                                    pointerEvents: (loading || maintenanceMode) ? 'none' : 'auto',
                                    boxShadow: '0 6px 16px rgba(197, 160, 54, 0.35)'
                                }}
                                onMouseEnter={(e) => !loading && !maintenanceMode && (e.currentTarget.style.backgroundColor = '#b8932f')}
                                onMouseLeave={(e) => !loading && !maintenanceMode && (e.currentTarget.style.backgroundColor = '#C5A036')}
                            >
                                {maintenanceMode ? (
                                    <>
                                        <AlertTriangle size={28} /> Service Unavailable
                                    </>
                                ) : loading ? (
                                    'Searching...'
                                ) : (
                                    <>
                                        <Search size={28} /> View Placement
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div style={{ marginTop: '2rem', padding: '1.25rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                <span style={{ fontWeight: 'bold' }}>Error:</span> {error}
                            </div>
                        )}
                        </div>
                    </div>
                ) : (
                    /* Student Placement Result - Matching First Image Design */
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '16px', 
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}>
                        {/* Header - Green with title and back button */}
                        <div className="placement-header" style={{ 
                            background: '#10b981',
                            padding: '1.25rem 2rem',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Building size={24} />
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Dormitory Placement</h2>
                                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>Student Room Assignment</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPlacement(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.25)',
                                    border: '1px solid rgba(255,255,255,0.4)',
                                    color: 'white',
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                            >
                                ← Back to Search
                            </button>
                        </div>

                        {/* Content - Two column layout */}
                        <div className="placement-content" style={{ 
                            flex: 1, 
                            padding: '2rem',
                            overflow: 'hidden',
                            display: 'flex',
                            gap: '2rem'
                        }}>
                            {/* Left: Room Number Box */}
                            <div className="room-box" style={{ 
                                flex: '0 0 340px',
                                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                borderRadius: '16px',
                                padding: '2.5rem 2rem',
                                textAlign: 'center',
                                border: '2px solid #fbbf24',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <p style={{ 
                                    color: '#92400e',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                    marginBottom: '1.5rem'
                                }}>Your Assigned Room</p>
                                <h1 style={{ 
                                    fontSize: '6rem',
                                    fontWeight: '800',
                                    color: '#b45309',
                                    margin: '0',
                                    lineHeight: 1
                                }}>
                                    {placement.room?.roomNumber || 'N/A'}
                                </h1>
                                <p style={{ 
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#92400e',
                                    margin: '1rem 0 0 0'
                                }}>
                                    {placement.room?.building || 'Unassigned'}
                                </p>
                            </div>

                            {/* Right: Student Details */}
                            <div className="details-grid" style={{ 
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}>
                                {/* University ID - Full width */}
                                <div className="detail-box" style={{
                                    padding: '1rem 1.25rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <p className="detail-label" style={{ 
                                        color: '#64748b',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        margin: '0 0 0.4rem 0'
                                    }}>University ID</p>
                                    <p className="detail-value" style={{ 
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: '#0f172a',
                                        margin: 0
                                    }}>{placement.studentId}</p>
                                </div>

                                {/* Full Name - Full width */}
                                <div className="detail-box" style={{
                                    padding: '1rem 1.25rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <p className="detail-label" style={{ 
                                        color: '#64748b',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        margin: '0 0 0.4rem 0'
                                    }}>Full Name</p>
                                    <p className="detail-value" style={{ 
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: '#0f172a',
                                        margin: 0
                                    }}>{placement.fullName}</p>
                                </div>

                                {/* Two column grid for remaining fields */}
                                <div style={{ 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '1rem'
                                }}>
                                    {/* Gender */}
                                    <div className="detail-box" style={{
                                        padding: '1rem 1.25rem',
                                        background: '#f8fafc',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <p className="detail-label" style={{ 
                                            color: '#64748b',
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            margin: '0 0 0.4rem 0'
                                        }}>Gender</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <p className="detail-value" style={{ 
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#0f172a',
                                                margin: 0
                                            }}>{placement.gender === 'M' ? 'Male' : 'Female'}</p>
                                            {placement.gender === 'M' ? 
                                                <span style={{ color: '#3b82f6', fontSize: '1.2rem' }}>♂</span> : 
                                                <span style={{ color: '#ec4899', fontSize: '1.2rem' }}>♀</span>
                                            }
                                        </div>
                                    </div>

                                    {/* Department */}
                                    <div className="detail-box" style={{
                                        padding: '1rem 1.25rem',
                                        background: '#f8fafc',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <p className="detail-label" style={{ 
                                            color: '#64748b',
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            margin: '0 0 0.4rem 0'
                                        }}>Department</p>
                                        <p className="detail-value" style={{ 
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            color: '#0f172a',
                                            margin: 0
                                        }}>{placement.department}</p>
                                    </div>

                                    {/* Campus */}
                                    <div className="detail-box" style={{
                                        padding: '1rem 1.25rem',
                                        background: '#f8fafc',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <p className="detail-label" style={{ 
                                            color: '#64748b',
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            margin: '0 0 0.4rem 0'
                                        }}>Campus</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={16} color="#10b981" />
                                            <p className="detail-value" style={{ 
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#0f172a',
                                                margin: 0
                                            }}>Main Campus</p>
                                        </div>
                                    </div>

                                    {/* Room Capacity */}
                                    <div className="detail-box" style={{
                                        padding: '1rem 1.25rem',
                                        background: '#f8fafc',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <p className="detail-label" style={{ 
                                            color: '#64748b',
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            margin: '0 0 0.4rem 0'
                                        }}>Room Capacity</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Users size={16} color="#10b981" />
                                            <p className="detail-value" style={{ 
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#0f172a',
                                                margin: 0
                                            }}>{placement.room?.capacity} Students</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Download PDF Button - Green */}
                        <div style={{ 
                            padding: '1.25rem 2rem',
                            borderTop: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            flexShrink: 0
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
                                    width: '100%',
                                    padding: '0.9rem 2rem',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#059669';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#10b981';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                                }}
                            >
                                <Download size={20} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                )}
                </div>

            </main>

            {/* Footer */}
            <footer style={{ 
                backgroundColor: '#000000', 
                color: 'white', 
                textAlign: 'center', 
                padding: '1rem 2rem',
                flexShrink: 0,
                fontSize: '0.9rem'
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
                        transform: translateY(0);
                    }
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
                    
                    /* Placement result - stack layout */
                    .placement-content {
                        flex-direction: column !important;
                        gap: 1.5rem !important;
                        padding: 1.5rem !important;
                    }
                    .room-box {
                        flex: 1 !important;
                        min-height: auto !important;
                    }
                    .details-grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                @media (max-width: 640px) {
                    /* Mobile */
                    main {
                        padding: 1rem !important;
                    }
                    
                    /* Search form responsive */
                    .search-header {
                        padding: 2rem 1.5rem !important;
                    }
                    .search-header h2 {
                        font-size: 1.5rem !important;
                    }
                    .search-header p {
                        font-size: 0.95rem !important;
                    }
                    .search-form-content {
                        padding: 2.5rem 1.5rem !important;
                    }
                    .search-input {
                        padding: 1rem 1.25rem !important;
                        font-size: 1rem !important;
                    }
                    .search-button {
                        padding: 1.25rem !important;
                        font-size: 1rem !important;
                    }
                    
                    /* Placement header responsive */
                    .placement-header {
                        flex-direction: column !important;
                        gap: 1rem !important;
                        padding: 1rem 1.5rem !important;
                    }
                    .placement-header h2 {
                        font-size: 1.1rem !important;
                    }
                    .placement-header p {
                        font-size: 0.75rem !important;
                    }
                    
                    /* Room box responsive */
                    .room-box h1 {
                        font-size: 4rem !important;
                    }
                    .room-box p:last-child {
                        font-size: 1.2rem !important;
                    }
                    
                    /* Details responsive */
                    .detail-box {
                        padding: 0.85rem 1rem !important;
                    }
                    .detail-label {
                        font-size: 0.65rem !important;
                    }
                    .detail-value {
                        font-size: 0.95rem !important;
                    }
                    
                    /* Download button responsive */
                    .download-button {
                        padding: 1.25rem !important;
                        font-size: 1rem !important;
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
                    .room-box h1 {
                        font-size: 3rem !important;
                    }
                    .room-box p:last-child {
                        font-size: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default StudentPortal;
