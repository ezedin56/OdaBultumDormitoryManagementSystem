import { useState, useEffect } from 'react';
import { FileText, Filter, X, Users as UsersIcon, RefreshCw } from 'lucide-react';
import axios from 'axios';

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState({
        gender: '',
        department: '',
        block: '',
        roomNumber: '',
        year: ''
    });
    
    // Options for dropdowns
    const [departments, setDepartments] = useState([]);
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        fetchFilterOptions();
        
        // Refetch filter options when component becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchFilterOptions();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchFilterOptions = async () => {
        try {
            setRefreshing(true);
            const token = localStorage.getItem('token');
            
            // Fetch students to get unique departments
            const studentsRes = await axios.get('http://localhost:5000/api/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const uniqueDepts = [...new Set(studentsRes.data.map(s => s.department))].filter(Boolean).sort();
            setDepartments(uniqueDepts);
            
            // Fetch rooms to get blocks - use correct endpoint
            const roomsRes = await axios.get('http://localhost:5000/api/dorms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Get unique blocks from rooms
            // Each room has a 'building' field which represents the block name
            const uniqueBlocks = [...new Set(roomsRes.data.map(r => r.building))].filter(Boolean).sort();
            
            setBlocks(uniqueBlocks);
        } catch (error) {
            console.error('Error fetching filter options:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({
            gender: '',
            department: '',
            block: '',
            roomNumber: '',
            year: ''
        });
    };

    const buildQueryString = () => {
        const params = new URLSearchParams();
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.department) params.append('department', filters.department);
        if (filters.block) {
            // Block filter is the building name
            params.append('building', filters.block);
        }
        if (filters.roomNumber) params.append('roomNumber', filters.roomNumber);
        if (filters.year) params.append('year', filters.year);
        return params.toString() ? `?${params.toString()}` : '';
    };

    const getFilterSummary = () => {
        const active = [];
        if (filters.gender) active.push(filters.gender === 'M' ? 'Male' : 'Female');
        if (filters.department) active.push(filters.department);
        if (filters.block) active.push(`Block: ${filters.block}`);
        if (filters.roomNumber) active.push(`Room: ${filters.roomNumber}`);
        if (filters.year) active.push(`Year ${filters.year}`);
        return active.length > 0 ? active.join(', ') : 'All Students';
    };

    const generatePDF = async () => {
        setLoading(true);
        try {
            const queryString = buildQueryString();
            console.log('Generating PDF with query:', queryString);
            const response = await fetch(`http://localhost:5000/api/students/report/pdf${queryString}`, {
                method: 'GET',
                headers: { 'Accept': 'application/pdf' }
            });
            
            console.log('PDF Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('PDF Generation Error:', errorText);
                throw new Error(`Failed to generate PDF: ${response.status} - ${errorText}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `students_report_${Date.now()}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
            
            alert('PDF report downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const generateCSV = async () => {
        setLoading(true);
        try {
            const queryString = buildQueryString();
            console.log('Generating CSV with query:', queryString);
            const response = await fetch(`http://localhost:5000/api/students/report/csv${queryString}`, {
                method: 'GET',
                headers: { 'Accept': 'text/csv' }
            });
            
            console.log('CSV Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('CSV Generation Error:', errorText);
                throw new Error(`Failed to generate CSV: ${response.status} - ${errorText}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `students_report_${Date.now()}.csv`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
            
            alert('CSV report downloaded successfully!');
        } catch (error) {
            console.error('Error generating CSV:', error);
            alert('Failed to generate CSV report: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={28} color="#3b82f6" />
                    Generate Reports
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Filter and generate student reports in PDF or CSV format</p>
            </div>

            {/* Two-Column Layout */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Left Column - Filters Panel (Always Visible) */}
                <div style={{ width: '350px', flexShrink: 0 }}>
                    <div className="card" style={{ padding: '1.5rem', background: '#f8fafc', position: 'sticky', top: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={20} />
                                Filters
                                {hasActiveFilters && (
                                    <span style={{
                                        background: '#3b82f6',
                                        color: 'white',
                                        padding: '0.15rem 0.5rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {Object.values(filters).filter(v => v !== '').length}
                                    </span>
                                )}
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={fetchFilterOptions}
                                    disabled={refreshing}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: refreshing ? 'not-allowed' : 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        opacity: refreshing ? 0.6 : 1
                                    }}
                                    title="Refresh filter options"
                                >
                                    <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                                    Refresh
                                </button>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        <X size={14} />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Gender Filter */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
                                    Gender
                                </label>
                                <select
                                    value={filters.gender}
                                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        background: 'white'
                                    }}
                                >
                                    <option value="">All Genders</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>

                            {/* Department Filter */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
                                    Department
                                </label>
                                <select
                                    value={filters.department}
                                    onChange={(e) => handleFilterChange('department', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        background: 'white'
                                    }}
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Block Filter */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
                                    Block
                                </label>
                                <select
                                    value={filters.block}
                                    onChange={(e) => handleFilterChange('block', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        background: 'white'
                                    }}
                                >
                                    <option value="">All Blocks</option>
                                    {blocks.map(block => (
                                        <option key={block} value={block}>{block}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Room Number Filter */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
                                    Room Number
                                </label>
                                <input
                                    type="text"
                                    value={filters.roomNumber}
                                    onChange={(e) => handleFilterChange('roomNumber', e.target.value)}
                                    placeholder="e.g., 101, 202"
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        background: 'white'
                                    }}
                                />
                            </div>

                            {/* Year Filter */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
                                    Year Level
                                </label>
                                <select
                                    value={filters.year}
                                    onChange={(e) => handleFilterChange('year', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        background: 'white'
                                    }}
                                >
                                    <option value="">All Years</option>
                                    <option value="1">Year 1</option>
                                    <option value="2">Year 2</option>
                                    <option value="3">Year 3</option>
                                    <option value="4">Year 4</option>
                                    <option value="5">Year 5</option>
                                    <option value="6">Year 6</option>
                                    <option value="7">Year 7</option>
                                </select>
                            </div>
                        </div>

                        {/* Active Filters Summary */}
                        {hasActiveFilters && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '0.75rem',
                                background: '#dbeafe',
                                borderRadius: '8px',
                                border: '1px solid #3b82f6'
                            }}>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e40af', fontWeight: '600' }}>
                                    📊 {getFilterSummary()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Generate Buttons and Quick Filters */}
                <div style={{ flex: 1 }}>
                    {/* Generate Buttons */}
                    <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: '600' }}>
                            Generate Report
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            <button
                                onClick={generatePDF}
                                disabled={loading}
                                className="btn btn-primary"
                                style={{
                                    padding: '1.25rem',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    gap: '0.75rem',
                                    opacity: loading ? 0.6 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <FileText size={20} />
                                {loading ? 'Generating PDF...' : 'Generate PDF Report'}
                            </button>

                            <button
                                onClick={generateCSV}
                                disabled={loading}
                                className="btn btn-secondary"
                                style={{
                                    padding: '1.25rem',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    gap: '0.75rem',
                                    opacity: loading ? 0.6 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <FileText size={20} />
                                {loading ? 'Generating CSV...' : 'Generate CSV Report'}
                            </button>
                        </div>

                        {/* Report Preview Info */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                                Report will include:
                            </p>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.8' }}>
                                <li>List Number (if available)</li>
                                <li>Student Name</li>
                                <li>Student ID</li>
                                <li>Department</li>
                                <li>Room Assignment (Building-Room Number)</li>
                                <li>Filtered by: {getFilterSummary()}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Quick Filter Cards */}
                    <div>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>Quick Filters</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {/* All Students */}
                            <button
                                onClick={clearFilters}
                                style={{
                                    padding: '1rem',
                                    background: 'white',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                            >
                                <UsersIcon size={20} color="#8b5cf6" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>All Students</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No filters</div>
                            </button>

                            {/* Male Students */}
                            <button
                                onClick={() => handleFilterChange('gender', 'M')}
                                style={{
                                    padding: '1rem',
                                    background: 'white',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                            >
                                <UsersIcon size={20} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Male Students</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Gender: Male</div>
                            </button>

                            {/* Female Students */}
                            <button
                                onClick={() => handleFilterChange('gender', 'F')}
                                style={{
                                    padding: '1rem',
                                    background: 'white',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ec4899'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                            >
                                <UsersIcon size={20} color="#ec4899" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Female Students</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Gender: Female</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
