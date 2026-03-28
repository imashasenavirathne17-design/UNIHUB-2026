const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    actionType: {
        type: String,
        required: true,
    },
    details: {
        type: String,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

module.exports = mongoose.model("Log", logSchema);
