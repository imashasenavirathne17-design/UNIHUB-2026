const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    venue: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    registrationDeadline: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
        default: "Upcoming",
    },
    isBoosted: {
        type: Boolean,
        default: false,
    },
    isTrending: {
        type: Boolean,
        default: false,
    },
    boostActivationStatus: {
        type: String,
        enum: ["Inactive", "Active", "Completed"],
        default: "Inactive",
    },
    manualOverride: {
        remindersEnabled: { type: Boolean, default: true },
        boostModeEnabled: { type: Boolean, default: true },
        reminderThresholds: { type: [Number], default: [3, 1, 0.125, 0.02] } // Days (3d, 1d, 3h, 30m)
    }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
