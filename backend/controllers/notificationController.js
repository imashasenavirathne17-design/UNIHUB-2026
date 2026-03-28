const Notification = require("../models/Notification");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .populate("event", "title date time");
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};
