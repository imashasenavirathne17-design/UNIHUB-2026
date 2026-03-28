const mongoose = require('mongoose');

const skillOrderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
    },
    type: {
        type: String,
        enum: ['order', 'contact'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'delivered', 'completed', 'cancelled'],
        default: 'pending',
    },
    message: {
        type: String,
        required: true,
    },
    deliveredWork: {
        type: String, // Text, link, or brief description of work done
    },
    price: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('SkillOrder', skillOrderSchema);
