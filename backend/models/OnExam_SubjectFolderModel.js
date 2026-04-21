const mongoose = require('mongoose');

const onExamSubjectFolderSchema = new mongoose.Schema({
    subject_name: {
        type: String,
        required: [true, 'Subject name is required'],
        unique: true,
        trim: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('OnExam_SubjectFolder', onExamSubjectFolderSchema);
