const mongoose = require('mongoose');

const onExamPastPaperSchema = new mongoose.Schema({
    subject_folder_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OnExam_SubjectFolder',
        required: true,
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
    },
    semester: {
        type: String,
        required: [true, 'Semester is required'],
        enum: ['Semester 1', 'Semester 2'],
    },
    file_url: {
        type: String,
        required: [true, 'File URL is required'],
    },
    file_size: {
        type: String,
        default: 'Unknown',
    },
    title: {
        type: String,
        trim: true,
    },
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('OnExam_PastPaper', onExamPastPaperSchema);
