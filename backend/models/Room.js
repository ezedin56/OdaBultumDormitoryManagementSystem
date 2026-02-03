const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    building: {
        type: String,
        required: true
    },
    block: {
        type: String,
        required: false  // Optional field for blocks within buildings
    },
    floor: {
        type: Number,
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Single', 'Double', 'Triple', 'Quad', 'Dormitory'],
        default: 'Dormitory'
    },
    capacity: {
        type: Number,
        required: true,
        default: 4
    },
    occupants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    gender: {
        type: String,
        enum: ['M', 'F', 'Co-ed'], // Usually dorms are separated, but keeping flexibility
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Full', 'Under Maintenance'],
        default: 'Available'
    }
}, {
    timestamps: true
});

// Compound index to ensure unique room numbers per building
roomSchema.index({ building: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
