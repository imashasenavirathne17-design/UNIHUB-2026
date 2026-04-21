const express = require("express");
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getMyRegistrations,
    triggerRemindersManually,
    getEventRegistrants,
    toggleAttendance,
    updateEventOverrides,
    broadcastMessage
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
    .get(getEvents)
    .post(protect, authorize("organizer", "event organizer", "admin"), createEvent);

router.get("/my-registrations", protect, getMyRegistrations);

router.route("/:id")
    .get(getEventById)
    .put(protect, authorize("organizer", "event organizer", "admin"), updateEvent)
    .delete(protect, authorize("organizer", "event organizer", "admin"), deleteEvent);

router.post("/:id/register", protect, authorize("student"), registerForEvent);
router.post("/:id/unregister", protect, authorize("student"), unregisterFromEvent);

router.get("/:id/registrations", protect, authorize("organizer", "event organizer", "admin"), getEventRegistrants);
router.put("/:id/registrations/:userId/attendance", protect, authorize("organizer", "event organizer", "admin"), toggleAttendance);

router.put("/:id/manual-override", protect, authorize("organizer", "event organizer", "admin"), updateEventOverrides);
router.post("/:id/trigger-reminders", protect, authorize("admin"), triggerRemindersManually);
router.post("/:id/broadcast", protect, authorize("organizer", "event organizer", "admin"), broadcastMessage);

module.exports = router;
