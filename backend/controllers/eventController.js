const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Notification = require("../models/Notification");
const Log = require("../models/Log");

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer/Admin)
const createEvent = async (req, res) => {
    try {
        const { title, description, date, time, venue, capacity, category, registrationDeadline } = req.body;

        // Validation: Event date must be in the future
        if (new Date(date) <= new Date()) {
            return res.status(400).json({ message: "Event date must be in the future" });
        }

        // Validation: Deadline must be before event date
        if (new Date(registrationDeadline) >= new Date(date)) {
            return res.status(400).json({ message: "Registration deadline must be before the event date" });
        }

        const event = await Event.create({
            title,
            description,
            date,
            time,
            venue,
            capacity,
            category,
            registrationDeadline,
            organizer: req.user._id
        });

        await Log.create({
            user: req.user._id,
            actionType: "EVENT_CREATED",
            details: `Created event: ${title}`,
            event: event._id
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const events = await Event.find({}).populate("organizer", "name email");
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate("organizer", "name email");
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check ownership
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to update this event" });
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

        await Log.create({
            user: req.user._id,
            actionType: "EVENT_UPDATED",
            details: `Updated event: ${event.title}`,
            event: event._id
        });

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Admin)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this event" });
        }

        await event.deleteOne();

        await Log.create({
            user: req.user._id,
            actionType: "EVENT_DELETED",
            details: `Deleted event: ${event.title}`
        });

        res.json({ message: "Event removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private (Student)
const registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if event is cancelled or completed
        if (event.status === "Cancelled" || event.status === "Completed") {
            return res.status(400).json({ message: "Cannot register for a cancelled or completed event" });
        }

        // Check registration deadline
        if (new Date() > new Date(event.registrationDeadline)) {
            return res.status(400).json({ message: "Registration deadline has passed" });
        }

        // Check capacity
        const registrationCount = await Registration.countDocuments({ event: req.params.id, status: "Registered" });
        if (registrationCount >= event.capacity) {
            return res.status(400).json({ message: "Event capacity reached" });
        }

        // Check if already registered
        const existingRegistration = await Registration.findOne({ event: req.params.id, user: req.user._id });
        if (existingRegistration && existingRegistration.status === "Registered") {
            return res.status(400).json({ message: "Already registered for this event" });
        }

        if (existingRegistration) {
            existingRegistration.status = "Registered";
            await existingRegistration.save();
        } else {
            await Registration.create({
                event: req.params.id,
                user: req.user._id
            });
        }

        res.status(201).json({ message: "Successfully registered" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unregister from event
// @route   POST /api/events/:id/unregister
// @access  Private (Student)
const unregisterFromEvent = async (req, res) => {
    try {
        const registration = await Registration.findOne({ event: req.params.id, user: req.user._id });

        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }

        registration.status = "Cancelled";
        await registration.save();

        res.json({ message: "Successfully unregistered" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user registrations
// @route   GET /api/events/my-registrations
// @access  Private (Student)
const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user._id, status: "Registered" }).populate("event");
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manual override: Trigger reminders
// @route   POST /api/events/:id/trigger-reminders
// @access  Private (Admin)
const triggerRemindersManually = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const registrations = await Registration.find({ event: req.params.id, status: "Registered" });
        const notifications = registrations.map(reg => ({
            recipient: reg.user,
            message: `Manual Reminder: The event '${event.title}' is coming soon!`,
            type: "Reminder",
            event: event._id
        }));

        await Notification.insertMany(notifications);

        await Log.create({
            user: req.user._id,
            actionType: "MANUAL_REMINDER_TRIGGER",
            details: `Triggered reminders manually for event: ${event.title}`,
            event: event._id
        });

        res.json({ message: `Reminders triggered for ${notifications.length} users` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get event registrants
// @route   GET /api/events/:id/registrations
// @access  Private (Organizer/Admin)
const getEventRegistrants = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // Check ownership
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const registrations = await Registration.find({ event: req.params.id })
            .populate("user", "name email");
        
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user attendance
// @route   PUT /api/events/:id/registrations/:userId/attendance
// @access  Private (Organizer/Admin)
const toggleAttendance = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const registration = await Registration.findOne({ event: req.params.id, user: req.params.userId });
        if (!registration) return res.status(404).json({ message: "Registration not found" });

        registration.attended = req.body.attended;
        if (req.body.attended) {
            registration.status = "Attended"; // Optional status update
        } else {
            registration.status = "Registered";
        }
        await registration.save();

        res.json(registration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update manual overrides (reminders / boost)
// @route   PUT /api/events/:id/manual-override
// @access  Private (Organizer/Admin)
const updateEventOverrides = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        event.manualOverride = {
            ...event.manualOverride,
            ...req.body
        };
        await event.save();

        await Log.create({
            user: req.user._id,
            actionType: "OVERRIDE_UPDATED",
            details: `Updated overrides for event: ${event.title}`,
            event: event._id
        });

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
    updateEventOverrides
};
