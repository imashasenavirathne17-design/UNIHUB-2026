const express = require("express");
const router = express.Router();
const {
    createRequest,
    getRequests,
    updateRequestStatus
} = require("../controllers/eventRequestController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Student endpoints
router.post("/", protect, createRequest);

// Organizer/Admin endpoints
router.get("/", protect, authorize("organizer", "event organizer", "admin"), getRequests);
router.put("/:id/status", protect, authorize("organizer", "event organizer", "admin"), updateRequestStatus);

module.exports = router;
