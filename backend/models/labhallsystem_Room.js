const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['hall', 'lab'],
        required: true
    },
    floor: {
        type: Number,
        required: true,
        min: 1,
        max: 7
    },
    status: {
        type: String,
        enum: ['available', 'maintenance'],
        default: 'available'
    },
    capacity: {
        type: Number,
        default: 50
    },
    amenities: [{
        type: String,
        enum: ['wifi', 'projector', 'ac', 'sound_system', 'pc_lab', 'whiteboard']
    }]
}, { timestamps: true });

module.exports = mongoose.model('labhallsystem_Room', roomSchema);
