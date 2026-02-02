import { useState } from 'react';
import { FileText, Download, Users, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [selectedGender, setSelectedGender] = useState('');

    const generatePDF = async (gender) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/students/report/pdf?gender=${gender}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `students_${gender}_report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report');
        } finally {
            setLoading(false);
        }
    };

    const generateCSV = async (gender) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/students/report/csv?gender=${gender}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `students_${gender}_report.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating CSV:', error);
            alert('Failed to generate CSV report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={28} color="#3b82f6" />
                    Reports
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Generate and download student reports in PDF or CSV format</p>
            </div>

            {/* Report Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                
                {/* Male Students Report */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '12px', 
                            backgroundColor: '#dbeafe', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Users size={24} color="#3b82f6" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>Male Students</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Generate reports for male students</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            onClick={() => generatePDF('M')}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ 
                                width: '100%', 
                                justifyContent: 'center', 
                                gap: '0.5rem',
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <FileText size={18} />
                            {loading ? 'Generating...' : 'Generate PDF'}
                        </button>

                        <button
                            onClick={() => generateCSV('M')}
                            disabled={loading}
                            className="btn btn-secondary"
                            style={{ 
                                width: '100%', 
                                justifyContent: 'center', 
                                gap: '0.5rem',
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <FileSpreadsheet size={18} />
                            {loading ? 'Generating...' : 'Generate CSV'}
                        </button>
                    </div>
                </div>

                {/* Female Students Report */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '12px', 
                            backgroundColor: '#fce7f3', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Users size={24} color="#ec4899" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>Female Students</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Generate reports for female students</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            onClick={() => generatePDF('F')}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ 
                                width: '100%', 
                                justifyContent: 'center', 
                                gap: '0.5rem',
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <FileText size={18} />
                            {loading ? 'Generating...' : 'Generate PDF'}
                        </button>

                        <button
                            onClick={() => generateCSV('F')}
                            disabled={loading}
                            className="btn btn-secondary"
                            style={{ 
                                width: '100%', 
                                justifyContent: 'center', 
                                gap: '0.5rem',
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <FileSpreadsheet size={18} />
                            {loading ? 'Generating...' : 'Generate CSV'}
                        </button>
                    </div>
                </div>

            </div>

            {/* Info Section */}
            <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>Report Information</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                    <li>Reports include: List Number, Student Name, Student ID, Department, and Room Number</li>
                    <li>PDF reports are formatted in a professional table layout</li>
                    <li>CSV reports can be opened in Excel or any spreadsheet application</li>
                    <li>All student data is included without errors</li>
                </ul>
            </div>
        </div>
    );
};

export default Reports;
