const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Room = require('./models/Room');
const MaintenanceRequest = require('./models/MaintenanceRequest');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Student.deleteMany();
        await Room.deleteMany();
        await MaintenanceRequest.deleteMany();

        // Create users
        const admin = await User.create({
            username: 'admin',
            password: 'password123',
            email: 'admin@obu.edu.et',
            role: 'admin'
        });

        const maintenance = await User.create({
            username: 'maintenance',
            password: 'password123',
            email: 'maint@obu.edu.et',
            role: 'maintenance'
        });

        console.log('✅ Users created');

        // Create rooms
        const rooms = await Room.insertMany([
            { building: 'Block A', floor: 1, roomNumber: '101', type: 'Quad', capacity: 4, gender: 'M', status: 'Available' },
            { building: 'Block A', floor: 1, roomNumber: '102', type: 'Quad', capacity: 4, gender: 'M', status: 'Available' },
            { building: 'Block A', floor: 2, roomNumber: '201', type: 'Quad', capacity: 4, gender: 'F', status: 'Available' },
            { building: 'Block A', floor: 2, roomNumber: '202', type: 'Quad', capacity: 4, gender: 'F', status: 'Available' },
            { building: 'Block B', floor: 1, roomNumber: '101', type: 'Triple', capacity: 3, gender: 'M', status: 'Available' },
            { building: 'Block B', floor: 1, roomNumber: '102', type: 'Double', capacity: 2, gender: 'F', status: 'Available' },
        ]);

        console.log('✅ Rooms created');

        // Create students
        const students = await Student.insertMany([
            { studentId: 'OBU/001/2023', fullName: 'Abdi Mohammed', gender: 'M', department: 'Computer Science', year: 2, phone: '0911234567' },
            { studentId: 'OBU/002/2023', fullName: 'Fatuma Ahmed', gender: 'F', department: 'Engineering', year: 1, phone: '0922345678' },
            { studentId: 'OBU/003/2023', fullName: 'Chaltu Bekele', gender: 'F', department: 'Business', year: 3, phone: '0933456789' },
            { studentId: 'OBU/004/2023', fullName: 'Getachew Haile', gender: 'M', department: 'Computer Science', year: 2, phone: '0944567890' },
            { studentId: 'OBU/005/2023', fullName: 'Sara Tesfaye', gender: 'F', department: 'Medicine', year: 1, phone: '0955678901' },
        ]);

        console.log('✅ Students created');

        // Assign some students to rooms
        const room1 = rooms[0]; // Block A-101
        const room3 = rooms[2]; // Block A-201

        room1.occupants.push(students[0]._id, students[3]._id);
        room1.status = 'Available';
        await room1.save();

        room3.occupants.push(students[1]._id, students[2]._id);
        room3.status = 'Available';
        await room3.save();

        students[0].room = room1._id;
        await students[0].save();
        students[3].room = room1._id;
        await students[3].save();
        students[1].room = room3._id;
        await students[1].save();
        students[2].room = room3._id;
        await students[2].save();

        console.log('✅ Students assigned to rooms');

        // Create maintenance requests
        await MaintenanceRequest.insertMany([
            {
                student: students[0]._id,
                room: room1._id,
                issueType: 'Electrical',
                description: 'Power outlet not working',
                priority: 'Medium',
                status: 'Pending'
            },
            {
                student: students[1]._id,
                room: room3._id,
                issueType: 'Plumbing',
                description: 'Leaking faucet in bathroom',
                priority: 'High',
                status: 'In Progress',
                assignedTo: maintenance._id
            },
            {
                student: students[2]._id,
                room: room3._id,
                issueType: 'Furniture',
                description: 'Broken chair leg',
                priority: 'Low',
                status: 'Completed'
            }
        ]);

        console.log('✅ Maintenance requests created');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('   Username: admin');
        console.log('   Password: password123');

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};

seedData();
