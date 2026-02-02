import { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Building } from 'lucide-react';

const BulkImportAllocation = ({ onImportComplete, onAllocationComplete }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [allocating, setAllocating] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [allocationResult, setAllocationResult] = useState(null);
    const [error, setError] = useState('');

    // Filter States
    const [showFilters, setShowFilters] = useState(false);
    const [criteria, setCriteria] = useState({ department: '', year: '', gender: '' });
    const [targetBuilding, setTargetBuilding] = useState('');
    const [availableBuildings, setAvailableBuildings] = useState([]);

    useEffect(() => {
        // Fetch buildings for dropdown
        const fetchBuildings = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/dorms');
                const buildings = [...new Set(data.map(r => r.building))].sort();
                setAvailableBuildings(buildings);
            } catch (e) { console.error(e); }
        };
        fetchBuildings();
    }, []);

    const handleFileSelect = (e) => {
        setSelectedFile(e.target.files[0]);
        setError('');
        setImportResult(null);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            setError('Please select an Excel file first');
            return;
        }

        setImporting(true);
        setError('');
        setImportResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const { data } = await axios.post('http://localhost:5000/api/students/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setImportResult(data);
            setSelectedFile(null);
            // Reset file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

            if (onImportComplete) onImportComplete();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    const handleAutoAllocate = async () => {
        setAllocating(true);
        setError('');
        setAllocationResult(null);

        try {
            const payload = {
                criteria: {
                    ...(criteria.department && { department: criteria.department }),
                    ...(criteria.year && { year: criteria.year }),
                    ...(criteria.gender && { gender: criteria.gender }),
                },
                targetBuilding: targetBuilding || undefined
            };

            const { data } = await axios.post('http://localhost:5000/api/dorms/allocate', payload);
            setAllocationResult(data);
            if (onAllocationComplete) onAllocationComplete();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Allocation failed');
        } finally {
            setAllocating(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Import Section */}
            <div className="card" style={{ flex: '1', minWidth: '300px' }}>
                <h3 style={{ marginBottom: '1rem' }}>📥 Import Students</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Upload an Excel file with columns: studentId, fullName, gender, department, year, phone
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="input-field"
                        disabled={importing}
                    />

                    <button
                        onClick={handleImport}
                        className="btn btn-primary"
                        disabled={!selectedFile || importing}
                    >
                        {importing ? 'Importing...' : 'Import Students'}
                    </button>

                    {importResult && (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}>
                            <div style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                                ✅ Imported: {importResult.imported} students
                            </div>
                            {importResult.errors > 0 && (
                                <div style={{ color: 'var(--color-warning)' }}>
                                    ⚠️ Errors: {importResult.errors}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Allocation Section */}
            <div className="card" style={{ flex: '1', minWidth: '300px' }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 style={{ margin: 0 }}>🏠 Auto-Allocate Dorms</h3>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                    >
                        <Filter size={14} style={{ marginRight: '4px' }} />
                        {showFilters ? 'Hide Filters' : 'Targeted Allocation'}
                    </button>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Automatically assign students to dorms based on smart rules.
                </p>

                {showFilters && (
                    <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Allocation Filters (Optional)</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>Target Building</label>
                                <select
                                    className="input-field"
                                    style={{ padding: '0.4rem' }}
                                    value={targetBuilding}
                                    onChange={(e) => setTargetBuilding(e.target.value)}
                                >
                                    <option value="">Any Available</option>
                                    {availableBuildings.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>Department</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    style={{ padding: '0.4rem' }}
                                    placeholder="e.g. Software"
                                    value={criteria.department}
                                    onChange={(e) => setCriteria({ ...criteria, department: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>Year</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    style={{ padding: '0.4rem' }}
                                    placeholder="e.g. 1"
                                    value={criteria.year}
                                    onChange={(e) => setCriteria({ ...criteria, year: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>Gender</label>
                                <select
                                    className="input-field"
                                    style={{ padding: '0.4rem' }}
                                    value={criteria.gender}
                                    onChange={(e) => setCriteria({ ...criteria, gender: e.target.value })}
                                >
                                    <option value="">Any</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontStyle: 'italic' }}>
                            * Only unassigned students matching these criteria will be allocated to {targetBuilding ? `Building ${targetBuilding}` : 'any available building'}.
                        </div>
                    </div>
                )}

                {!showFilters && (
                    <ul style={{ fontSize: '0.85rem', marginBottom: '1rem', marginLeft: '1.5rem', color: 'var(--text-muted)' }}>
                        <li>Fresh students: Alphabetically</li>
                        <li>Senior students: By department, then alphabetically</li>
                        <li>Gender separation enforced</li>
                    </ul>
                )}

                <button
                    onClick={handleAutoAllocate}
                    className="btn btn-success"
                    disabled={allocating}
                    style={{ width: '100%' }}
                >
                    {allocating ? 'Allocating...' : 'Run Allocation'}
                </button>

                {allocationResult && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        marginTop: '1rem'
                    }}>
                        <div style={{ color: allocationResult.allocated > 0 ? 'var(--color-success)' : 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                            {allocationResult.message}
                        </div>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            <div>Males: {allocationResult.details?.malesAllocated || 0} allocated</div>
                            <div>Females: {allocationResult.details?.femalesAllocated || 0} allocated</div>
                            {allocationResult.unallocated > 0 && (
                                <div style={{ color: 'var(--color-warning)', marginTop: '0.5rem' }}>
                                    ⚠️ {allocationResult.unallocated} matching students could not be allocated
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="card" style={{ width: '100%', backgroundColor: 'var(--color-danger-light)', borderLeft: '4px solid var(--color-danger)' }}>
                    <p style={{ color: 'var(--color-danger)', margin: 0 }}>{error}</p>
                </div>
            )}
        </div>
    );
};

export default BulkImportAllocation;
