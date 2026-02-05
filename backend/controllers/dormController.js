const asyncHandler = require('express-async-handler');
const Room = require('../models/Room');
const Student = require('../models/Student');
const SystemSettings = require('../models/SystemSettings');

// @desc    Get all rooms
// @route   GET /api/dorms
// @access  Private
const getRooms = asyncHandler(async (req, res) => {
    const rooms = await Room.find({}).populate('occupants');
    res.json(rooms);
});

// @desc    Get room by ID
// @route   GET /api/dorms/:id
// @access  Private
const getRoomById = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id).populate('occupants');

    if (room) {
        res.json(room);
    } else {
        res.status(404);
        throw new Error('Room not found');
    }
});

// @desc    Create new room
// @route   POST /api/dorms
// @access  Private/Admin
const createRoom = asyncHandler(async (req, res) => {
    let { building, block, floor, roomNumber, type, capacity, gender } = req.body;

    // If capacity is not provided, use system default
    if (!capacity) {
        const settings = await SystemSettings.findOne();
        capacity = settings?.maxStudentsPerRoom || 4;
    }

    const room = await Room.create({
        building,
        block,
        floor,
        roomNumber,
        type,
        capacity,
        gender,
        status: 'Available'
    });

    if (room) {
        res.status(201).json(room);
    } else {
        res.status(400);
        throw new Error('Invalid room data');
    }
});

// @desc    Update room
// @route   PUT /api/dorms/:id
// @access  Private/Admin
const updateRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (room) {
        room.building = req.body.building || room.building;
        room.floor = req.body.floor || room.floor;
        room.roomNumber = req.body.roomNumber || room.roomNumber;
        room.type = req.body.type || room.type;
        room.capacity = req.body.capacity || room.capacity;
        room.gender = req.body.gender || room.gender;
        room.status = req.body.status || room.status;

        const updatedRoom = await room.save();
        res.json(updatedRoom);
    } else {
        res.status(404);
        throw new Error('Room not found');
    }
});

// @desc    Delete room
// @route   DELETE /api/dorms/:id
// @access  Private/Admin
const deleteRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (room) {
        await room.deleteOne();
        res.json({ message: 'Room removed' });
    } else {
        res.status(404);
        throw new Error('Room not found');
    }
});

// @desc    Assign student to room
// @route   POST /api/dorms/:id/assign
// @access  Private/Admin
const assignStudentToRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);
    const student = await Student.findById(req.body.studentId);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // Check if room is full
    if (room.occupants.length >= room.capacity) {
        res.status(400);
        throw new Error('Room is full');
    }

    // Check gender match
    if (room.gender !== student.gender && room.gender !== 'Co-ed') {
        res.status(400);
        throw new Error('Gender mismatch');
    }

    // Check if student is already in a room
    if (student.room) {
        if (student.room.toString() === room._id.toString()) {
            res.status(400);
            throw new Error('Student is already in this room');
        }

        // Remove from old room
        const oldRoom = await Room.findById(student.room);
        if (oldRoom) {
            oldRoom.occupants = oldRoom.occupants.filter(id => id.toString() !== student._id.toString());
            // Update status if it was full
            if (oldRoom.occupants.length < oldRoom.capacity && oldRoom.status === 'Full') {
                oldRoom.status = 'Available';
            }
            await oldRoom.save();
        }
    }

    // Add student to new room
    room.occupants.push(student._id);
    if (room.occupants.length >= room.capacity) {
        room.status = 'Full';
    }

    await room.save();

    // Update student's room
    student.room = room._id;
    await student.save();

    res.json({ message: 'Student assigned successfully', room });
});

// @desc    Remove student from room
// @route   POST /api/dorms/:id/remove
// @access  Private/Admin
const removeStudentFromRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);
    const { studentId } = req.body;

    // Find student (optional verification)
    const Student = require('../models/Student');
    const student = await Student.findById(studentId);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Remove student from room occupants
    const initialLength = room.occupants.length;
    room.occupants = room.occupants.filter(id => id.toString() !== studentId);

    if (room.occupants.length === initialLength) {
        res.status(400);
        throw new Error('Student not found in this room');
    }

    // Update status
    if (room.occupants.length < room.capacity) {
        room.status = 'Available';
    }

    await room.save();

    // Update student record if found
    if (student) {
        student.room = null;
        await student.save();
    }

    res.json({ message: 'Student removed from room', room });
});

// @desc    Auto-allocate students to dorms
// @route   POST /api/dorms/allocate
// @access  Private/Admin
// @desc    Auto-allocate students to dorms (with optional filters)
// @route   POST /api/dorms/allocate
// @access  Private/Admin
const autoAllocate = asyncHandler(async (req, res) => {
    const { criteria, targetBuilding, targetBlock } = req.body; // Add targetBlock

    // 1. Build Student Query
    const studentQuery = { room: null };
    if (criteria?.department) studentQuery.department = criteria.department;
    if (criteria?.year) studentQuery.year = parseInt(criteria.year);
    if (criteria?.gender) studentQuery.gender = criteria.gender;

    // Get unassigned students matching filters
    let unassignedStudents = await Student.find(studentQuery);

    if (unassignedStudents.length === 0) {
        return res.json({
            success: true,
            message: 'No matching unassigned students found',
            allocated: 0,
            details: { malesAllocated: 0, femalesAllocated: 0, unallocated: 0 }
        });
    }

    // 2. Build Room Query
    const roomQuery = { status: { $ne: 'Under Maintenance' } };
    if (targetBuilding) roomQuery.building = targetBuilding;
    if (targetBlock) roomQuery.block = targetBlock; // Add block filter

    // 3. Separate and Sort Students
    const maleStudents = unassignedStudents.filter(s => s.gender === 'M');
    const femaleStudents = unassignedStudents.filter(s => s.gender === 'F');

    // Sort function (Seniors > Freshmen, Department grouping)
    const sortStudents = (students) => {
        const freshmen = students.filter(s => s.year === 1);
        const seniors = students.filter(s => s.year > 1);

        freshmen.sort((a, b) => a.fullName.localeCompare(b.fullName));
        seniors.sort((a, b) => {
            if (a.department !== b.department) return a.department.localeCompare(b.department);
            return a.fullName.localeCompare(b.fullName);
        });

        return [...seniors, ...freshmen];
    };

    const sortedMaleStudents = sortStudents(maleStudents);
    const sortedFemaleStudents = sortStudents(femaleStudents);

    // 4. Fetch Available Rooms
    // We need separate queries for M and F to respect building choices + gender constraints
    const maleRoomQuery = { ...roomQuery, gender: 'M' };
    const femaleRoomQuery = { ...roomQuery, gender: 'F' };

    // Note: If gender criteria was strict (e.g. only F), one list will be empty
    const maleRooms = await Room.find(maleRoomQuery).sort({ building: 1, floor: 1, roomNumber: 1 });
    const femaleRooms = await Room.find(femaleRoomQuery).sort({ building: 1, floor: 1, roomNumber: 1 });

    let allocatedCount = 0;
    const allocationDetails = [];

    // Allocation logic
    const allocateToRooms = async (students, rooms) => {
        let studentIndex = 0;
        let assignedInThisRun = 0;

        for (const room of rooms) {
            // Re-check capacity in case of concurrency (though unlikely here)
            // But relying on in-memory object is safe for single-request sequential flow
            const availableSpace = room.capacity - room.occupants.length;

            if (availableSpace > 0 && studentIndex < students.length) {
                const studentsToAssign = students.slice(studentIndex, studentIndex + availableSpace);

                for (const student of studentsToAssign) {
                    room.occupants.push(student._id);
                    student.room = room._id;
                    await student.save();
                    allocatedCount++;
                    assignedInThisRun++;

                    allocationDetails.push({
                        studentId: student.studentId,
                        fullName: student.fullName,
                        room: `${room.building}-${room.roomNumber}`,
                        year: student.year,
                        department: student.department
                    });
                }

                // CRITICAL: Update room status based on occupancy
                if (room.occupants.length >= room.capacity) {
                    room.status = 'Full';
                } else if (room.occupants.length > 0) {
                    room.status = 'Available'; // Partially occupied but still available
                }

                await room.save();
                studentIndex += studentsToAssign.length;
            }

            if (studentIndex >= students.length) break;
        }

        return assignedInThisRun;
    };

    const malesAllocated = await allocateToRooms(sortedMaleStudents, maleRooms);
    const femalesAllocated = await allocateToRooms(sortedFemaleStudents, femaleRooms);

    const unallocatedMales = sortedMaleStudents.length - malesAllocated;
    const unallocatedFemales = sortedFemaleStudents.length - femalesAllocated;

    res.json({
        success: true,
        message: `Successfully allocated ${allocatedCount} students`,
        allocated: allocatedCount,
        unallocated: unallocatedMales + unallocatedFemales,
        details: {
            malesAllocated,
            femalesAllocated,
            unallocatedMales,
            unallocatedFemales,
            allocations: allocationDetails
        }
    });
});

// @desc    Get system-wide statistics
// @route   GET /api/dorms/statistics
// @access  Private/Admin
const getStatistics = asyncHandler(async (req, res) => {
    const Student = require('../models/Student');

    // Room statistics
    const totalRooms = await Room.countDocuments();
    const fullRooms = await Room.countDocuments({ status: 'Full' });
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Under Maintenance' });

    // Student statistics
    const totalStudents = await Student.countDocuments();
    const assignedStudents = await Student.countDocuments({ room: { $ne: null } });
    const unassignedStudents = totalStudents - assignedStudents;

    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 ? Math.round((fullRooms / totalRooms) * 100) : 0;

    res.json({
        rooms: {
            total: totalRooms,
            full: fullRooms,
            available: availableRooms,
            maintenance: maintenanceRooms,
            occupancyRate
        },
        students: {
            total: totalStudents,
            assigned: assignedStudents,
            unassigned: unassignedStudents
        }
    });
});

module.exports = {
    getRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    assignStudentToRoom,
    removeStudentFromRoom,
    autoAllocate,
    getStatistics,
};
