const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["Reminder", "Promotional", "System", "Admin"],
        default: "System",
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
    },
    actionUrl: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
