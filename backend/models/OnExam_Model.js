const mongoose = require('mongoose');

const onExamSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Exam title is required'],
        trim: true,
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: [true, 'Difficulty is required'],
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute'],
    },
    pdfUrl: {
        type: String,
        default: '',
    },
    questions: [
        {
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            answer: { type: String, required: true },
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('OnExam', onExamSchema);
