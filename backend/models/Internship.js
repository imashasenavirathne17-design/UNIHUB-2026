const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    company: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Remote', 'On-site', 'Hybrid'],
        default: 'On-site',
    },
    description: {
        type: String,
        required: true,
    },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    stipend: {
        type: String,
        default: 'Unpaid',
    },
    duration: {
        type: String,
        default: '3 months',
    },
    deadline: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
