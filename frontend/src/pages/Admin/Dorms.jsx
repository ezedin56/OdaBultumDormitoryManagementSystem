import { useState, useEffect } from 'react';
import { Building, Plus, Edit2, Trash2, X, Save, Users, Bed, Home, Settings } from 'lucide-react';
import axios from 'axios';

const Dorms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [blocks, setBlocks] = useState([]);
    
    // Modal States
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    
    // Form States
    const [blockForm, setBlockForm] = useState({ name: '', description: '', gender: 'M' });
    const [roomForm, setRoomForm] = useState({
        building: '', roomNumber: '', floor: 1, type: 'Quad', 
        capacity: 4, gender: 'M', status: 'Available'
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        if (rooms.length > 0) {
            const uniqueBlocks = [...new Set(rooms.map(r => r.building))];
            const blockData = uniqueBlocks.map(building => {
                const blockRooms = rooms.filter(r => r.building === building);
                // All rooms in a block must have the same gender
                const blockGender = blockRooms[0]?.gender || 'M';
                
                return {
                    name: building,
                    gender: blockGender,
                    totalRooms: blockRooms.length,
                    totalCapacity: blockRooms.reduce((sum, r) => sum + r.capacity, 0),
                    occupied: blockRooms.reduce((sum, r) => sum + r.occupants.length, 0),
                    rooms: blockRooms
                };
            });
            setBlocks(blockData);
            if (!activeTab && blockData.length > 0) {
                setActiveTab(blockData[0].name);
            }
        }
    }, [rooms]);

    const fetchRooms = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/dorms');
            setRooms(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            setLoading(false);
        }
    };

    // Block Operations
    const handleAddBlock = () => {
        setEditingBlock(null);
        setBlockForm({ name: '', description: '', gender: 'M' });
        setShowBlockModal(true);
    };

    const handleEditBlock = (block) => {
        setEditingBlock(block);
        setBlockForm({ name: block.name, description: block.description || '', gender: block.gender });
        setShowBlockModal(true);
    };

    const handleSaveBlock = async () => {
        if (!blockForm.name.trim()) {
            alert('Block name is required');
            return;
        }

        if (editingBlock) {
            // Update all rooms in this block with new name and gender
            try {
                const blockRooms = rooms.filter(r => r.building === editingBlock.name);
                await Promise.all(
                    blockRooms.map(room => 
                        axios.put(`http://localhost:5000/api/dorms/${room._id}`, {
                            ...room,
                            building: blockForm.name,
                            gender: blockForm.gender
                        })
                    )
                );
                fetchRooms();
                setShowBlockModal(false);
                setActiveTab(blockForm.name);
                alert('Block updated successfully!');
            } catch (error) {
                alert('Failed to update block');
            }
        } else {
            // Create a new block by creating a placeholder room
            try {
                // Create first room in the new block
                await axios.post('http://localhost:5000/api/dorms', {
                    building: blockForm.name,
                    roomNumber: '101',
                    floor: 1,
                    type: 'Quad',
                    capacity: 4,
                    gender: blockForm.gender,
                    status: 'Available'
                });
                
                fetchRooms();
                setShowBlockModal(false);
                setActiveTab(blockForm.name);
                alert(`Block "${blockForm.name}" created successfully! You can now add more rooms.`);
            } catch (error) {
                alert('Failed to create block: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleDeleteBlock = async (blockName) => {
        const blockRooms = rooms.filter(r => r.building === blockName);
        if (blockRooms.length > 0) {
            if (!window.confirm(`This block has ${blockRooms.length} rooms. Delete all rooms in this block?`)) {
                return;
            }
            try {
                await Promise.all(blockRooms.map(room => axios.delete(`http://localhost:5000/api/dorms/${room._id}`)));
                fetchRooms();
                setActiveTab(blocks[0]?.name || '');
            } catch (error) {
                alert('Failed to delete block');
            }
        }
    };

    // Room Operations
    const handleAddRoom = () => {
        setEditingRoom(null);
        // Set room gender to match the block gender
        const blockGender = activeBlock?.gender || 'M';
        setRoomForm({
            building: activeTab || blockForm.name,
            roomNumber: '', floor: 1, type: 'Quad',
            capacity: 4, gender: blockGender, status: 'Available'
        });
        setShowRoomModal(true);
    };

    const handleEditRoom = (room) => {
        setEditingRoom(room);
        setRoomForm({
            building: room.building,
            roomNumber: room.roomNumber,
            floor: room.floor,
            type: room.type,
            capacity: room.capacity,
            gender: room.gender,
            status: room.status
        });
        setShowRoomModal(true);
    };

    const handleSaveRoom = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await axios.put(`http://localhost:5000/api/dorms/${editingRoom._id}`, roomForm);
            } else {
                await axios.post('http://localhost:5000/api/dorms', roomForm);
            }
            fetchRooms();
            setShowRoomModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await axios.delete(`http://localhost:5000/api/dorms/${roomId}`);
                fetchRooms();
            } catch (error) {
                alert('Failed to delete room');
            }
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    const activeBlock = blocks.find(b => b.name === activeTab);

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                            <Building size={32} /> Dormitory Management
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Manage blocks, rooms, and occupancy
                        </p>
                    </div>
                    <button onClick={handleAddBlock} className="btn btn-primary" style={{ gap: '0.5rem' }}>
                        <Plus size={18} /> Add Block
                    </button>
                </div>
            </div>

            {/* Overall Stats */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem', 
                marginBottom: '2rem' 
            }}>
                <StatCard 
                    icon={<Home size={24} />} 
                    label="Total Blocks" 
                    value={blocks.length}
                    color="#3b82f6"
                />
                <StatCard 
                    icon={<Bed size={24} />} 
                    label="Total Rooms" 
                    value={rooms.length}
                    color="#8b5cf6"
                />
                <StatCard 
                    icon={<Users size={24} />} 
                    label="Total Capacity" 
                    value={rooms.reduce((sum, r) => sum + r.capacity, 0)}
                    color="#10b981"
                />
                <StatCard 
                    icon={<Users size={24} />} 
                    label="Occupied Beds" 
                    value={rooms.reduce((sum, r) => sum + r.occupants.length, 0)}
                    color="#f59e0b"
                />
            </div>

            {/* Tabs for Blocks */}
            {blocks.length > 0 ? (
                <>
                    <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem', 
                        borderBottom: '2px solid #e5e7eb',
                        marginBottom: '2rem',
                        overflowX: 'auto',
                        paddingBottom: '0.5rem'
                    }}>
                        {blocks.map(block => {
                            const genderColor = block.gender === 'M' ? '#3b82f6' : '#ec4899';
                            const genderLabel = block.gender === 'M' ? '♂ Male' : '♀ Female';
                            
                            return (
                                <button
                                    key={block.name}
                                    onClick={() => setActiveTab(block.name)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: 'none',
                                        background: activeTab === block.name ? genderColor : 'transparent',
                                        color: activeTab === block.name ? 'white' : 'var(--text-main)',
                                        borderRadius: '8px 8px 0 0',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap',
                                        position: 'relative',
                                        borderBottom: activeTab === block.name ? `3px solid ${genderColor}` : 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>{block.name}</span>
                                        <span style={{ 
                                            fontSize: '0.75rem',
                                            opacity: 0.8
                                        }}>
                                            ({block.rooms.length})
                                        </span>
                                    </div>
                                    <span style={{ 
                                        fontSize: '0.7rem',
                                        opacity: activeTab === block.name ? 0.9 : 0.6,
                                        fontWeight: 500
                                    }}>
                                        {genderLabel}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Block Content */}
                    {activeBlock && (
                        <div>
                            {/* Block Info Card */}
                            <div className="card" style={{ 
                                marginBottom: '2rem',
                                background: activeBlock.gender === 'M' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                                           'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                <h2 style={{ margin: 0 }}>{activeBlock.name}</h2>
                                                <span style={{
                                                    background: 'rgba(255,255,255,0.25)',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    backdropFilter: 'blur(10px)'
                                                }}>
                                                    {activeBlock.gender === 'M' ? '♂ Male Block' : '♀ Female Block'}
                                                </span>
                                            </div>
                                            <p style={{ opacity: 0.9, marginBottom: '1rem' }}>
                                                Block Information & Statistics
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={() => handleEditBlock(activeBlock)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                    color: 'white',
                                                    padding: '0.5rem',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Settings size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteBlock(activeBlock.name)}
                                                style={{
                                                    background: 'rgba(239,68,68,0.8)',
                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                    color: 'white',
                                                    padding: '0.5rem',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                                        gap: '1rem',
                                        marginTop: '1rem'
                                    }}>
                                        <BlockStat label="Total Rooms" value={activeBlock.totalRooms} />
                                        <BlockStat label="Total Capacity" value={activeBlock.totalCapacity} />
                                        <BlockStat label="Occupied" value={activeBlock.occupied} />
                                        <BlockStat 
                                            label="Occupancy Rate" 
                                            value={`${Math.round((activeBlock.occupied / activeBlock.totalCapacity) * 100)}%`} 
                                        />
                                    </div>
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    top: '-50px',
                                    right: '-50px',
                                    width: '200px',
                                    height: '200px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '50%'
                                }}></div>
                            </div>

                            {/* Add Room Button */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Rooms in {activeBlock.name}</h3>
                                <button onClick={handleAddRoom} className="btn btn-primary" style={{ gap: '0.5rem' }}>
                                    <Plus size={18} /> Add Room
                                </button>
                            </div>

                            {/* Rooms Table */}
                            {activeBlock.rooms.length > 0 ? (
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ 
                                            width: '100%', 
                                            borderCollapse: 'collapse',
                                            fontSize: '0.9rem'
                                        }}>
                                            <thead>
                                                <tr style={{ 
                                                    background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                                                    borderBottom: '2px solid #e2e8f0'
                                                }}>
                                                    <th style={{ 
                                                        padding: '1rem', 
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        color: '#475569'
                                                    }}>Room #</th>
                                                    <th style={{ 
                                                        padding: '1rem', 
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        color: '#475569'
                                                    }}>Floor</th>
                                                    <th style={{ 
                                                        padding: '1rem', 
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        color: '#475569'
                                                    }}>Type</th>
                                                    <th style={{ 
                                                        padding: '1rem', 
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        color: '#475569'
                                                    }}>Gender</th>
                                                    <th style={{ 
                                                        padding: '1rem', 
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        color: '#475569'
                                                    }}>Capacity</th>
                                                    <th style={{ 
                                                        padding: '1rem', 
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        color: '#475569'
                                                    }}>Occupancy</th>
                                                    <th style={{ 
                                                        padding: '1rem', 
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        color: '#475569'
                                                    }}>Status</th>
                                                    <th style={{ 
                                                        padding: '1rem', 
                                                        textAlign: 'center',
                                                        fontWeight: 600,
                                                        color: '#475569'
                                                    }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeBlock.rooms.map((room, index) => {
                                                    const occupancyPercent = (room.occupants.length / room.capacity) * 100;
                                                    const genderColor = room.gender === 'M' ? '#3b82f6' : '#ec4899';
                                                    
                                                    return (
                                                        <tr 
                                                            key={room._id}
                                                            style={{ 
                                                                borderBottom: '1px solid #e2e8f0',
                                                                background: index % 2 === 0 ? 'white' : '#fafafa',
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa'}
                                                        >
                                                            <td style={{ padding: '1rem' }}>
                                                                <span style={{ 
                                                                    fontWeight: 600,
                                                                    fontSize: '1rem',
                                                                    color: '#1e293b'
                                                                }}>
                                                                    {room.roomNumber}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '1rem', color: '#64748b' }}>
                                                                Floor {room.floor}
                                                            </td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <span style={{
                                                                    padding: '0.25rem 0.75rem',
                                                                    background: '#f1f5f9',
                                                                    borderRadius: '999px',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 500,
                                                                    color: '#475569'
                                                                }}>
                                                                    {room.type}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <div style={{
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        borderRadius: '4px',
                                                                        background: genderColor,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: 'white',
                                                                        fontWeight: 700,
                                                                        fontSize: '0.75rem'
                                                                    }}>
                                                                        {room.gender}
                                                                    </div>
                                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                                        {room.gender === 'M' ? 'Male' : 'Female'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <span style={{ 
                                                                    fontWeight: 600,
                                                                    color: '#1e293b'
                                                                }}>
                                                                    {room.capacity}
                                                                </span>
                                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}> beds</span>
                                                            </td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        <span style={{ 
                                                                            fontSize: '0.85rem',
                                                                            fontWeight: 600,
                                                                            color: occupancyPercent >= 100 ? '#dc2626' : 
                                                                                   occupancyPercent >= 75 ? '#f59e0b' : '#10b981'
                                                                        }}>
                                                                            {room.occupants.length}/{room.capacity}
                                                                        </span>
                                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                                            ({Math.round(occupancyPercent)}%)
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ 
                                                                        width: '100px',
                                                                        height: '6px',
                                                                        background: '#e2e8f0',
                                                                        borderRadius: '999px',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <div style={{
                                                                            width: `${occupancyPercent}%`,
                                                                            height: '100%',
                                                                            background: occupancyPercent >= 100 ? '#dc2626' : 
                                                                                       occupancyPercent >= 75 ? '#f59e0b' : '#10b981',
                                                                            transition: 'width 0.3s'
                                                                        }}></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <span style={{
                                                                    padding: '0.35rem 0.75rem',
                                                                    borderRadius: '999px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 600,
                                                                    background: room.status === 'Available' ? '#dcfce7' : '#fee2e2',
                                                                    color: room.status === 'Available' ? '#166534' : '#991b1b'
                                                                }}>
                                                                    {room.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <div style={{ 
                                                                    display: 'flex', 
                                                                    gap: '0.5rem',
                                                                    justifyContent: 'center'
                                                                }}>
                                                                    <button 
                                                                        onClick={() => handleEditRoom(room)}
                                                                        className="btn btn-secondary"
                                                                        style={{ 
                                                                            padding: '0.4rem 0.75rem',
                                                                            fontSize: '0.85rem',
                                                                            gap: '0.25rem'
                                                                        }}
                                                                        title="Edit Room"
                                                                    >
                                                                        <Edit2 size={14} /> Edit
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteRoom(room._id)}
                                                                        className="btn btn-secondary"
                                                                        style={{ 
                                                                            padding: '0.4rem 0.75rem',
                                                                            color: 'var(--color-danger)',
                                                                            borderColor: 'var(--color-danger)'
                                                                        }}
                                                                        title="Delete Room"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="card" style={{ 
                                    textAlign: 'center', 
                                    padding: '3rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <Bed size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                    <p>No rooms in this block yet</p>
                                    <button onClick={handleAddRoom} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                        Add First Room
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="card" style={{ 
                    textAlign: 'center', 
                    padding: '4rem',
                    color: 'var(--text-muted)'
                }}>
                    <Building size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <h3>No Blocks Yet</h3>
                    <p>Create your first dormitory block to get started</p>
                    <button onClick={handleAddBlock} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        <Plus size={18} /> Create First Block
                    </button>
                </div>
            )}

            {/* Block Modal */}
            {showBlockModal && (
                <Modal onClose={() => setShowBlockModal(false)} title={editingBlock ? 'Edit Block' : 'Add New Block'}>
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveBlock(); }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Block Name *
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                value={blockForm.name}
                                onChange={(e) => setBlockForm({ ...blockForm, name: e.target.value })}
                                placeholder="e.g., Block A, Building 1"
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Block Gender *
                            </label>
                            <select
                                className="input-field"
                                value={blockForm.gender}
                                onChange={(e) => setBlockForm({ ...blockForm, gender: e.target.value })}
                                required
                            >
                                <option value="M">♂ Male Block</option>
                                <option value="F">♀ Female Block</option>
                            </select>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                All rooms in this block will be set to this gender
                            </p>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Description (Optional)
                            </label>
                            <textarea
                                className="input-field"
                                value={blockForm.description}
                                onChange={(e) => setBlockForm({ ...blockForm, description: e.target.value })}
                                placeholder="Add any notes about this block..."
                                rows="3"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowBlockModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                                <Save size={18} /> Save Block
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Room Modal */}
            {showRoomModal && (
                <Modal onClose={() => setShowRoomModal(false)} title={editingRoom ? 'Edit Room' : 'Add New Room'}>
                    <form onSubmit={handleSaveRoom}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Block *
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={roomForm.building}
                                    onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Room Number *
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={roomForm.roomNumber}
                                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                                    placeholder="101"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Floor *
                                </label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={roomForm.floor}
                                    onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value) })}
                                    min="1"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Capacity *
                                </label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={roomForm.capacity}
                                    onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Type *
                                </label>
                                <select
                                    className="input-field"
                                    value={roomForm.type}
                                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                                >
                                    <option value="Single">Single</option>
                                    <option value="Double">Double</option>
                                    <option value="Triple">Triple</option>
                                    <option value="Quad">Quad</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Gender *
                                </label>
                                <select
                                    className="input-field"
                                    value={roomForm.gender}
                                    onChange={(e) => setRoomForm({ ...roomForm, gender: e.target.value })}
                                    disabled={true}
                                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                                >
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    Gender is set by the block
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowRoomModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                                <Save size={18} /> Save Room
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

// Helper Components
const StatCard = ({ icon, label, value, color }) => (
    <div className="card" style={{ 
        textAlign: 'center',
        background: 'white',
        borderLeft: `4px solid ${color}`
    }}>
        <div style={{ color, marginBottom: '0.5rem' }}>{icon}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
);

const BlockStat = ({ label, value }) => (
    <div style={{ 
        background: 'rgba(255,255,255,0.15)', 
        padding: '0.75rem', 
        borderRadius: '8px',
        backdropFilter: 'blur(10px)'
    }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
    </div>
);

const RoomCard = ({ room, onEdit, onDelete }) => {
    const occupancyPercent = (room.occupants.length / room.capacity) * 100;
    const genderColor = room.gender === 'M' ? '#3b82f6' : '#ec4899';
    
    return (
        <div className="card" style={{ 
            borderLeft: `4px solid ${genderColor}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>Room {room.roomNumber}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                        Floor {room.floor} • {room.type}
                    </p>
                </div>
                <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: room.status === 'Available' ? '#dcfce7' : '#fee2e2',
                    color: room.status === 'Available' ? '#166534' : '#991b1b'
                }}>
                    {room.status}
                </div>
            </div>

            <div style={{ 
                background: '#f8fafc', 
                padding: '0.75rem', 
                borderRadius: '8px',
                marginBottom: '1rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Occupancy</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {room.occupants.length} / {room.capacity}
                    </span>
                </div>
                <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: '#e2e8f0', 
                    borderRadius: '999px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${occupancyPercent}%`,
                        height: '100%',
                        background: occupancyPercent >= 100 ? '#ef4444' : occupancyPercent >= 75 ? '#f59e0b' : '#10b981',
                        transition: 'width 0.3s'
                    }}></div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: genderColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                }}>
                    {room.gender}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    {room.gender === 'M' ? 'Male' : 'Female'} Room
                </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                    onClick={() => onEdit(room)} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, gap: '0.5rem' }}
                >
                    <Edit2 size={16} /> Edit
                </button>
                <button 
                    onClick={() => onDelete(room._id)} 
                    className="btn btn-secondary" 
                    style={{ 
                        padding: '0.5rem 1rem',
                        color: 'var(--color-danger)',
                        borderColor: 'var(--color-danger)'
                    }}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

const Modal = ({ children, onClose, title }) => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
    }}>
        <div className="card" style={{ 
            width: '90%', 
            maxWidth: '600px', 
            maxHeight: '90vh', 
            overflow: 'auto',
            animation: 'slideUp 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>{title}</h2>
                <button 
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        color: 'var(--text-muted)'
                    }}
                >
                    <X size={24} />
                </button>
            </div>
            {children}
        </div>
        <style>{`
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `}</style>
    </div>
);

export default Dorms;
