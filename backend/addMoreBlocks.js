const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const connectDB = require('./config/db');

dotenv.config();

const addMoreBlocks = async () => {
    try {
        await connectDB();

        console.log('🏗️  Adding more dormitory blocks...\n');

        // Define new blocks with rooms
        const newRooms = [
            // Block B - Male Block
            { building: 'Block B', floor: 1, roomNumber: '101', type: 'Quad', capacity: 4, gender: 'M', status: 'Available' },
            { building: 'Block B', floor: 1, roomNumber: '102', type: 'Quad', capacity: 4, gender: 'M', status: 'Available' },
            { building: 'Block B', floor: 1, roomNumber: '103', type: 'Triple', capacity: 3, gender: 'M', status: 'Available' },
            { building: 'Block B', floor: 2, roomNumber: '201', type: 'Quad', capacity: 4, gender: 'M', status: 'Available' },
            { building: 'Block B', floor: 2, roomNumber: '202', type: 'Quad', capacity: 4, gender: 'M', status: 'Available' },
            { building: 'Block B', floor: 2, roomNumber: '203', type: 'Double', capacity: 2, gender: 'M', status: 'Available' },

            // Block C - Female Block
            { building: 'Block C', floor: 1, roomNumber: '101', type: 'Quad', capacity: 4, gender: 'F', status: 'Available' },
            { building: 'Block C', floor: 1, roomNumber: '102', type: 'Quad', capacity: 4, gender: 'F', status: 'Available' },
            { building: 'Block C', floor: 1, roomNumber: '103', type: 'Triple', capacity: 3, gender: 'F', status: 'Available' },
            { building: 'Block C', floor: 2, roomNumber: '201', type: 'Quad', capacity: 4, gender: 'F', status: 'Available' },
            { building: 'Block C', floor: 2, roomNumber: '202', type: 'Double', capacity: 2, gender: 'F', status: 'Available' },
            { building: 'Block C', floor: 2, roomNumber: '203', type: 'Triple', capacity: 3, gender: 'F', status: 'Available' },

            // Block D - Male Block
            { building: 'Block D', floor: 1, roomNumber: '101', type: 'Quad', capacity: 4, gender: 'M', status: 'Available' },
            { building: 'Block D', floor: 1, roomNumber: '102', type: 'Triple', capacity: 3, gender: 'M', status: 'Available' },
            { building: 'Block D', floor: 2, roomNumber: '201', type: 'Quad', capacity: 4, gender: 'M', status: 'Available' },
            { building: 'Block D', floor: 2, roomNumber: '202', type: 'Quad', capacity: 4, gender: 'M', status: 'Available' },
            { building: 'Block D', floor: 3, roomNumber: '301', type: 'Double', capacity: 2, gender: 'M', status: 'Available' },
            { building: 'Block D', floor: 3, roomNumber: '302', type: 'Triple', capacity: 3, gender: 'M', status: 'Available' },

            // Block E - Female Block
            { building: 'Block E', floor: 1, roomNumber: '101', type: 'Quad', capacity: 4, gender: 'F', status: 'Available' },
            { building: 'Block E', floor: 1, roomNumber: '102', type: 'Quad', capacity: 4, gender: 'F', status: 'Available' },
            { building: 'Block E', floor: 2, roomNumber: '201', type: 'Triple', capacity: 3, gender: 'F', status: 'Available' },
            { building: 'Block E', floor: 2, roomNumber: '202', type: 'Quad', capacity: 4, gender: 'F', status: 'Available' },
            { building: 'Block E', floor: 3, roomNumber: '301', type: 'Double', capacity: 2, gender: 'F', status: 'Available' },
            { building: 'Block E', floor: 3, roomNumber: '302', type: 'Double', capacity: 2, gender: 'F', status: 'Available' },
        ];

        let created = 0;
        let skipped = 0;

        for (const roomData of newRooms) {
            // Check if room already exists
            const existing = await Room.findOne({
                building: roomData.building,
                roomNumber: roomData.roomNumber
            });

            if (existing) {
                console.log(`⏭️  Skipped: ${roomData.building}-${roomData.roomNumber} (already exists)`);
                skipped++;
            } else {
                await Room.create(roomData);
                console.log(`✅ Created: ${roomData.building}-${roomData.roomNumber} (${roomData.gender}, ${roomData.type}, Capacity: ${roomData.capacity})`);
                created++;
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('📊 SUMMARY');
        console.log('═══════════════════════════════════════');
        console.log(`✅ Created: ${created} rooms`);
        console.log(`⏭️  Skipped: ${skipped} rooms (already exist)`);

        // Show block summary
        const allRooms = await Room.find({});
        const blocks = {};
        
        allRooms.forEach(room => {
            if (!blocks[room.building]) {
                blocks[room.building] = { male: 0, female: 0, total: 0, capacity: 0 };
            }
            blocks[room.building].total++;
            blocks[room.building].capacity += room.capacity;
            if (room.gender === 'M') blocks[room.building].male++;
            if (room.gender === 'F') blocks[room.building].female++;
        });

        console.log('\n═══════════════════════════════════════');
        console.log('🏢 BLOCKS IN SYSTEM');
        console.log('═══════════════════════════════════════');
        
        Object.keys(blocks).sort().forEach(blockName => {
            const block = blocks[blockName];
            const gender = block.male > 0 && block.female === 0 ? '♂ Male' :
                          block.female > 0 && block.male === 0 ? '♀ Female' : '⚥ Mixed';
            console.log(`${blockName} (${gender}): ${block.total} rooms, ${block.capacity} beds`);
        });

        console.log('\n🎉 Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

addMoreBlocks();
