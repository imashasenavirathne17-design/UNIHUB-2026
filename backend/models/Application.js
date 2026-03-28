const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
    status: { type: String, enum: ['pending', 'shortlisted', 'accepted', 'rejected'] },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' }, // private org note
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true,
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending',
    },
    statusHistory: [statusHistorySchema],
    coverLetter: {
        type: String,
        required: true,
    },
    resumeData: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    orgNote: {
        type: String,   // private note from organization
        default: '',
    },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ internshipId: 1, applicantId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
