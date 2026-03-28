const express = require("express");
const router = express.Router();
const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/mark-all-read", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);

module.exports = router;
