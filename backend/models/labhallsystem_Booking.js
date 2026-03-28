const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'labhallsystem_Room',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // format "HH:mm"
        required: true
    },
    endTime: {
        type: String, // format "HH:mm"
        required: true
    },
    lecturerName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'moved'],
        default: 'confirmed'
    },
    recurrence: {
        type: String,
        enum: ['none', 'weekly'],
        default: 'none'
    },
    recurrenceGroupId: {
        type: String,
        default: null
    },
    isCheckedIn: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('labhallsystem_Booking', bookingSchema);
