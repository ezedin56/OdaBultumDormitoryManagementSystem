import { useState } from 'react';
import axios from 'axios';

const BulkImportAllocation = ({ onImportComplete, onAllocationComplete }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [allocating, setAllocating] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [allocationResult, setAllocationResult] = useState(null);
    const [error, setError] = useState('');

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
            const { data } = await axios.post('http://localhost:5000/api/dorms/allocate');
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
                <h3 style={{ marginBottom: '1rem' }}>🏠 Auto-Allocate Dorms</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Automatically assign students to dorms based on smart rules:
                </p>
                <ul style={{ fontSize: '0.85rem', marginBottom: '1rem', marginLeft: '1.5rem' }}>
                    <li>Fresh students: Alphabetically</li>
                    <li>Senior students: By department, then alphabetically</li>
                    <li>Gender separation enforced</li>
                </ul>

                <button
                    onClick={handleAutoAllocate}
                    className="btn btn-success"
                    disabled={allocating}
                    style={{ width: '100%' }}
                >
                    {allocating ? 'Allocating...' : 'Run Auto-Allocation'}
                </button>

                {allocationResult && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        marginTop: '1rem'
                    }}>
                        <div style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                            ✅ {allocationResult.message}
                        </div>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            <div>Males: {allocationResult.details?.malesAllocated || 0} allocated</div>
                            <div>Females: {allocationResult.details?.femalesAllocated || 0} allocated</div>
                            {allocationResult.unallocated > 0 && (
                                <div style={{ color: 'var(--color-warning)', marginTop: '0.5rem' }}>
                                    ⚠️ {allocationResult.unallocated} students could not be allocated (insufficient rooms)
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
