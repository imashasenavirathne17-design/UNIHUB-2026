const mongoose = require('mongoose');

const lostFoundItemSchema = new mongoose.Schema({
    type: { type: String, enum: ['lost', 'found'], required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, default: Date.now },
    image: { type: String }, // URL to image
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'pending', 'resolved'], default: 'open' },
    tags: [String],
    bounty: { type: String, default: '' },
    handoverPin: { type: String, default: () => Math.floor(100000 + Math.random() * 900000).toString() }
}, { timestamps: true });

module.exports = mongoose.model('LostFoundItem', lostFoundItemSchema);
