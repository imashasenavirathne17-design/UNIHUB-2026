const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    context: {
        type: String, // e.g. internship title or project name
        default: '',
    },
}, { timestamps: true });

// One review per reviewer per target
reviewSchema.index({ reviewerId: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
