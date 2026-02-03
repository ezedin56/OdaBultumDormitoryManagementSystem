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
            {/* Minimal Header */}
            <header style={{
                backgroundColor: '#16a085', // Vibrant Teal Green
                padding: '1rem 2rem',
                borderBottom: '4px solid #cca300', // Gold border correction
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                height: '80px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '48px',
                        height: '48px'
                    }}>
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpWVhGUfDQPtwCOjcwTE3tQiAl0obKpwvN1A&s"
                            alt="OBU Logo"
                            style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: 'white',
                            margin: 0,
                            fontFamily: '"Playfair Display", serif',
                            letterSpacing: '0.025em'
                        }}>Oda Bultum University</h1>

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
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                            overflow: 'hidden',
                            marginBottom: '2rem'
                        }}>
                        {/* Header */}
                        <div style={{
                            backgroundColor: '#0f172a', // Dark blue
                            color: 'white',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            borderBottom: '3px solid #cca300' // Gold accent
                        }}>
                            <FileText size={24} color="#cca300" />
                            <h2 style={{
                                margin: 0,
                                fontFamily: '"Playfair Display", serif',
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                letterSpacing: '0.025em',
                                color: 'white'
                            }}>Dormitory Placement Details</h2>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '2rem' }}>
                            {/* Room Featured Card */}
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '16px',
                                padding: '2rem',
                                textAlign: 'center',
                                border: '1px solid #e5e7eb',
                                marginBottom: '2rem'
                            }}>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Your Room</p>
                                <h1 style={{
                                    fontFamily: '"Playfair Display", serif',
                                    fontSize: '3.5rem',
                                    color: '#d97706', // Gold
                                    fontWeight: '700',
                                    margin: '0',
                                    lineHeight: '1'
                                }}>{placement.room?.roomNumber}</h1>
                                <p style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginTop: '0.5rem'
                                }}>{placement.room?.building}</p>
                            </div>

                            {/* Details List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* University ID */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>University ID</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: '700', color: '#111827' }}>{placement.studentId}</span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(placement.studentId)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af' }}
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Full Name</span>
                                    <span style={{ fontWeight: '700', color: '#111827' }}>{placement.fullName}</span>
                                </div>

                                {/* Sex */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Sex</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: '700', color: '#111827' }}>{placement.gender === 'M' ? 'M' : 'F'}</span>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f3f4f6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.8rem'
                                        }}>
                                            {placement.gender === 'M' ? '♂' : '♀'}
                                        </div>
                                    </div>
                                </div>

                                {/* Department */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Department</span>
                                    <span style={{
                                        backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600'
                                    }}>
                                        {placement.department}
                                    </span>
                                </div>

                                {/* Building */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Building</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontWeight: '700' }}>
                                        <Building2 size={16} color="#d97706" /> {placement.room?.building}
                                    </div>
                                </div>

                                {/* Room Number */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Room Number</span>
                                    <span style={{ color: '#d97706', fontWeight: '700', fontSize: '1.2rem' }}>{placement.room?.roomNumber}</span>
                                </div>

                                {/* Campus */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Campus</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontWeight: '700' }}>
                                        <MapPin size={16} color="#d97706" /> Main Campus
                                    </div>
                                </div>

                                {/* Capacity */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Capacity</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontWeight: '700' }}>
                                        <Users size={16} color="#d97706" /> {placement.room?.capacity} Students
                                    </div>
                                </div>
                            </div>



                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button style={{
                                    flex: 1,
                                    backgroundColor: '#0f172a',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer'
                                }} onClick={() => window.print()}>
                                    <Printer size={18} /> Print
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#f3f4f6',
                                        color: '#1f2937',
                                        border: '1px solid #e5e7eb',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer'
                                    }}>
                                    <Download size={18} /> Save PDF
                                </button>
                            </div>
                        </div>


                    </div>
                )
                }
            </main>

            <footer style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#e5e7eb', // Light gray text
                fontSize: '0.9rem',
                backgroundColor: '#16a085', // Vibrant Teal Green matching header
                borderTop: '1px solid #14532d' // Slightly darker border
            }}>
                © 2026 Oda Bultum University - Dormitory Management System
                {placement && (
                    <div
                        style={{ marginTop: '0.75rem', color: '#cca300', cursor: 'pointer', fontWeight: '500' }}
                        onClick={() => setPlacement(null)}
                    >
                        Back to Search
                    </div>
                )}
            </footer>
        </div>
    );
};

export default StudentPortal;
