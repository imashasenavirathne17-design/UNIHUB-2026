const express = require("express");
const router = express.Router();
const {
    getGlobalEventAnalytics,
    getEventAnalytics,
    getRiskDetection,
    getAuditLogs
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/events/global", protect, authorize("admin"), getGlobalEventAnalytics);
router.get("/events/:id", protect, authorize("organizer", "admin"), getEventAnalytics);
router.get("/risk-detection", protect, authorize("admin"), getRiskDetection);
router.get("/audit-logs", protect, authorize("admin"), getAuditLogs);

module.exports = router;
