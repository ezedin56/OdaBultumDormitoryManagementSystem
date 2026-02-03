const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const connectDB = require('./config/db');

dotenv.config();

const fixMixedBlocks = async () => {
    try {
        await connectDB();

        console.log('🔧 Fixing mixed gender blocks...\n');

        // Get all rooms
        const allRooms = await Room.find({});
        
        // Group by building
        const blocks = {};
        allRooms.forEach(room => {
            if (!blocks[room.building]) {
                blocks[room.building] = [];
            }
            blocks[room.building].push(room);
        });

        console.log('Current blocks:');
        Object.keys(blocks).forEach(blockName => {
            const rooms = blocks[blockName];
            const genders = [...new Set(rooms.map(r => r.gender))];
            console.log(`  ${blockName}: ${genders.join(', ')} (${rooms.length} rooms)`);
        });

        console.log('\n🔄 Updating Block A and Block B to be gender-specific...\n');

        // Update Block A - Make it Male only
        const blockARooms = await Room.find({ building: 'Block A' });
        for (const room of blockARooms) {
            room.gender = 'M';
            await room.save();
            console.log(`✅ Updated ${room.building}-${room.roomNumber} to Male`);
        }

        // Update Block B - Make it Male only
        const blockBRooms = await Room.find({ building: 'Block B' });
        for (const room of blockBRooms) {
            room.gender = 'M';
            await room.save();
            console.log(`✅ Updated ${room.building}-${room.roomNumber} to Male`);
        }

        console.log('\n═══════════════════════════════════════');
        console.log('📊 UPDATED BLOCKS');
        console.log('═══════════════════════════════════════');

        // Show updated summary
        const updatedRooms = await Room.find({});
        const updatedBlocks = {};
        
        updatedRooms.forEach(room => {
            if (!updatedBlocks[room.building]) {
                updatedBlocks[room.building] = { male: 0, female: 0, total: 0, capacity: 0 };
            }
            updatedBlocks[room.building].total++;
            updatedBlocks[room.building].capacity += room.capacity;
            if (room.gender === 'M') updatedBlocks[room.building].male++;
            if (room.gender === 'F') updatedBlocks[room.building].female++;
        });

        Object.keys(updatedBlocks).sort().forEach(blockName => {
            const block = updatedBlocks[blockName];
            const gender = block.male > 0 && block.female === 0 ? '♂ Male' :
                          block.female > 0 && block.male === 0 ? '♀ Female' : '⚥ Mixed';
            console.log(`${blockName} (${gender}): ${block.total} rooms, ${block.capacity} beds`);
        });

        console.log('\n🎉 All blocks are now gender-specific!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixMixedBlocks();
