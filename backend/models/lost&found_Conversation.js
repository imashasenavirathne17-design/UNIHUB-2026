const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostFoundItem' },
    lastMessage: { type: String },
    lastUpdateTime: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
