const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const Room = require('../models/Room');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');

// @desc    Create database backup (export all data as JSON)
// @route   GET /api/backup/database
// @access  Private/Admin
const createDatabaseBackup = asyncHandler(async (req, res) => {
    try {
        console.log('📦 Creating database backup...');

        // Fetch all data from collections
        const students = await Student.find({}).populate('room').lean();
        const rooms = await Room.find({}).populate('occupants').lean();
        const users = await User.find({}).select('-password').lean(); // Exclude passwords
        const settings = await SystemSettings.find({}).lean();

        // Create backup object with metadata
        const backup = {
            metadata: {
                backupDate: new Date().toISOString(),
                version: '1.0.0',
                system: 'Oda Bultum Dormitory Management System'
            },
            data: {
                students: students,
                rooms: rooms,
                users: users,
                systemSettings: settings
            },
            statistics: {
                totalStudents: students.length,
                totalRooms: rooms.length,
                totalUsers: users.length,
                assignedStudents: students.filter(s => s.room).length,
                unassignedStudents: students.filter(s => !s.room).length
            }
        };

        console.log('✅ Backup created successfully');
        console.log(`📊 Statistics: ${backup.statistics.totalStudents} students, ${backup.statistics.totalRooms} rooms`);

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=database_backup_${new Date().toISOString().split('T')[0]}.json`);
        
        // Send backup as JSON
        res.json(backup);
    } catch (error) {
        console.error('❌ Backup error:', error);
        res.status(500);
        throw new Error('Failed to create database backup: ' + error.message);
    }
});

// @desc    Get backup statistics
// @route   GET /api/backup/stats
// @access  Private/Admin
const getBackupStats = asyncHandler(async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const roomCount = await Room.countDocuments();
        const userCount = await User.countDocuments();
        const assignedCount = await Student.countDocuments({ room: { $ne: null } });

        res.json({
            totalStudents: studentCount,
            totalRooms: roomCount,
            totalUsers: userCount,
            assignedStudents: assignedCount,
            unassignedStudents: studentCount - assignedCount,
            lastBackup: null // Can be enhanced to track last backup time
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to get backup statistics');
    }
});

module.exports = {
    createDatabaseBackup,
    getBackupStats
};
