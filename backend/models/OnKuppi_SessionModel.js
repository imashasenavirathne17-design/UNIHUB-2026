const mongoose = require('mongoose');

const onKuppiSessionSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Subject name is required'],
        trim: true,
    },
    year: {
        type: String,
        required: [true, 'Academic year is required'],
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    },
    semester: {
        type: String,
        required: [true, 'Academic semester is required'],
        enum: ['Semester 1', 'Semester 2'],
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    time: {
        type: String,
        required: [true, 'Time is required'],
    },
    description: {
        type: String,
        trim: true,
    },
    teams_link: {
        type: String,
        trim: true,
        required: [true, 'Microsoft Teams link is required'],
    },
    file_url: {
        type: String,
        default: '',
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('OnKuppi_Session', onKuppiSessionSchema);
