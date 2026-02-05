import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search, User, FileText, Copy, Building2, MapPin, Users, Printer, Download, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
        if (e) e.preventDefault();
        if (!studentId) return;

        setError('');
        setPlacement(null);
        setLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/students/lookup', {
                studentId
            });

            // Artificial delay for UX
            setTimeout(() => {
                setPlacement(data);
                setLoading(false);
            }, 800);
        } catch (err) {
            setError(err.response?.data?.message || 'Student not found');
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('placement-result');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Dorm_Placement_${studentId}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError('Failed to generate PDF. Please try again.');
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
        <div style={{
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            fontFamily: '"Inter", sans-serif',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '1rem 2rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                height: '80px'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    height: '100%'
                }}>
                    {/* Left side - Logo and University Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img 
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpWVhGUfDQPtwCOjcwTE3tQiAl0obKpwvN1A&s" 
                            alt="OBU Logo" 
                            style={{ 
                                width: '50px', 
                                height: '50px', 
                                objectFit: 'contain',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '4px'
                            }} 
                        />
                        <div>
                            <h1 style={{ 
                                margin: 0, 
                                fontSize: '1.5rem', 
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                Oda Bultum University
                            </h1>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '0.9rem',
                                color: 'rgba(255,255,255,0.9)'
                            }}>
                                Dormitory Management System
                            </p>
                        </div>
                    </div>

                    {/* Right side - Contact Info */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '1.5rem',
                        color: 'white',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={18} />
                            <span>info@obu.edu.et</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={18} />
                            <span>+251-25-551-1234</span>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                paddingTop: '100px', // Header height + padding
                paddingBottom: '80px', // Footer height + padding
                overflow: 'hidden' // Prevent scrolling
            }}>

                {!placement ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
                        padding: '3rem 2.5rem',
                        width: '100%',
                        maxWidth: '550px',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        {/* Gold Accent Top Border */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '80%',
                            height: '4px',
                            backgroundColor: '#cca300', // Gold
                            borderRadius: '0 0 8px 8px'
                        }}></div>

                        <h2 style={{
                            fontFamily: '"Playfair Display", serif',
                            color: '#111827',
                            fontSize: '2rem',
                            fontWeight: '700',
                            marginBottom: '1rem',
                            marginTop: '0.5rem'
                        }}>Find Your Dorm Placement</h2>

                        <p style={{
                            color: '#6b7280',
                            marginBottom: '2.5rem',
                            fontSize: '0.95rem'
                        }}>
                            Enter your university ID to view your assigned accommodation
                        </p>

                        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ textAlign: 'left' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#b49000', // Gold/Dark Yellow
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <User size={16} /> University ID
                                </label>
                                <input
                                    type="text"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    placeholder=""
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        backgroundColor: '#f3f4f6',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        color: '#1f2937',
                                        outline: 'none'
                                    }}
                                />
                            </div>



                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    marginTop: '1rem',
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: '#cca300', // Gold
                                    color: '#1f2937', // Dark text for contrast on gold
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                {loading ? 'SEARCHING...' : (
                                    <>
                                        <Search size={18} /> VIEW PLACEMENT
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <p style={{ color: '#ef4444', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                                {error}
                            </p>
                        )}
                    </div>

                ) : (
                    <div
                        id="placement-result"
                        style={{
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: 'calc(100vh - 200px)',
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                        {/* Header */}
                        <div style={{
                            backgroundColor: '#0f172a',
                            color: 'white',
                            padding: '1rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            borderBottom: '3px solid #cca300',
                            flexShrink: 0
                        }}>
                            <FileText size={20} color="#cca300" />
                            <h2 style={{
                                margin: 0,
                                fontFamily: '"Playfair Display", serif',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                letterSpacing: '0.025em',
                                color: 'white'
                            }}>Dormitory Placement Details</h2>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.25rem', flex: 1, overflow: 'hidden' }}>
                            {/* Room Featured Card */}
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                textAlign: 'center',
                                border: '1px solid #e5e7eb',
                                marginBottom: '1.25rem'
                            }}>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Your Room</p>
                                <h1 style={{
                                    fontFamily: '"Playfair Display", serif',
                                    fontSize: '2.5rem',
                                    color: '#d97706',
                                    fontWeight: '700',
                                    margin: '0',
                                    lineHeight: '1'
                                }}>{placement.room?.roomNumber}</h1>
                                <p style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginTop: '0.25rem'
                                }}>{placement.room?.building}</p>
                            </div>

                            {/* Details List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {/* University ID */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>University ID</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>{placement.studentId}</span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(placement.studentId)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af' }}
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Full Name</span>
                                    <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>{placement.fullName}</span>
                                </div>

                                {/* Sex */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Sex</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>{placement.gender === 'M' ? 'M' : 'F'}</span>
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#f3f4f6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.75rem'
                                        }}>
                                            {placement.gender === 'M' ? '♂' : '♀'}
                                        </div>
                                    </div>
                                </div>

                                {/* Department */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Department</span>
                                    <span style={{
                                        backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600'
                                    }}>
                                        {placement.department}
                                    </span>
                                </div>

                                {/* Building */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Building</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontWeight: '700', fontSize: '0.9rem' }}>
                                        <Building2 size={14} color="#d97706" /> {placement.room?.building}
                                    </div>
                                </div>

                                {/* Room Number */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Room Number</span>
                                    <span style={{ color: '#d97706', fontWeight: '700', fontSize: '1.1rem' }}>{placement.room?.roomNumber}</span>
                                </div>

                                {/* Campus */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Campus</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontWeight: '700', fontSize: '0.9rem' }}>
                                        <MapPin size={14} color="#d97706" /> Main Campus
                                    </div>
                                </div>

                                {/* Capacity */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Capacity</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontWeight: '700', fontSize: '0.9rem' }}>
                                        <Users size={14} color="#d97706" /> {placement.room?.capacity} Students
                                    </div>
                                </div>
                            </div>



                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                                <button style={{
                                    flex: 1,
                                    backgroundColor: '#0f172a',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.65rem',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }} onClick={() => window.print()}>
                                    <Printer size={16} /> Print
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#f3f4f6',
                                        color: '#1f2937',
                                        border: '1px solid #e5e7eb',
                                        padding: '0.65rem',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}>
                                    <Download size={16} /> Save PDF
                                </button>
                            </div>

                            {/* Back to Search Button */}
                            <button
                                onClick={() => setPlacement(null)}
                                style={{
                                    width: '100%',
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                            >
                                <Search size={18} /> New Search
                            </button>
                        </div>


                    </div>
                )
                }
            </main>

            <footer style={{
                padding: '1rem 2rem',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '0.85rem',
                backgroundColor: '#111827',
                borderTop: '2px solid #10b981'
            }}>
                © 2026 Oda Bultum University - All rights reserved.
            </footer>
        </div>
    );
};

export default StudentPortal;
