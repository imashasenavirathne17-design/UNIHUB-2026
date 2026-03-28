const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    deliveryTime: {
        type: String,
        default: '3 days',
    },
}, { timestamps: true });

module.exports = mongoose.model('Gig', gigSchema);
