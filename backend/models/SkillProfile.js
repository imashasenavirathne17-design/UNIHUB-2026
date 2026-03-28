const mongoose = require('mongoose');

const skillProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    bio: {
        type: String,
        default: '',
    },
    githubUrl: {
        type: String,
        default: '',
    },
    linkedinUrl: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('SkillProfile', skillProfileSchema);
