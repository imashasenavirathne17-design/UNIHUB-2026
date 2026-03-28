const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["Registered", "Attended", "Cancelled"],
        default: "Registered",
    },
    attended: {
        type: Boolean,
        default: false,
    },
    notified: {
        type: Map,
        of: Boolean,
        default: {
            "3d": false,
            "1d": false,
            "3h": false,
            "30m": false
        }
    }
}, { timestamps: true });

// Prevent duplicate registrations
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
