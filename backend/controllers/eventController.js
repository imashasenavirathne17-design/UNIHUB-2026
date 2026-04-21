const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Notification = require("../models/Notification");
const Log = require("../models/Log");
const sendEmail = require("../utils/sendEmail");

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

        // Send confirmation email
        await sendEmail({
            email: req.user.email,
            subject: `Registration Confirmed: ${event.title}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #14B8A6; font-size: 28px; font-weight: 800; margin: 0;">Registration Successful!</h1>
                        <p style="color: #64748B; font-size: 16px; margin-top: 8px;">You're on the guest list for ${event.title}</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #14B8A6 0%, #0d9488 100%); padding: 25px; border-radius: 12px; color: white; margin-bottom: 30px;">
                        <h2 style="margin: 0 0 15px 0; font-size: 20px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px;">Event Pass</h2>
                        <table style="width: 100%; color: white;">
                            <tr>
                                <td style="padding: 5px 0; font-size: 12px; text-transform: uppercase; opacity: 0.8;">Event</td>
                                <td style="padding: 5px 0; font-size: 12px; text-transform: uppercase; opacity: 0.8;">Venue</td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 15px; font-weight: 700;">${event.title}</td>
                                <td style="padding-bottom: 15px; font-weight: 700;">${event.venue}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; font-size: 12px; text-transform: uppercase; opacity: 0.8;">Date</td>
                                <td style="padding: 5px 0; font-size: 12px; text-transform: uppercase; opacity: 0.8;">Time</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 700;">${new Date(event.date).toLocaleDateString()}</td>
                                <td style="font-weight: 700;">${event.time}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="padding: 20px; background-color: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
                        <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                            <strong>Hello ${req.user.name},</strong><br>
                            Your registration for the upcoming campus activity has been confirmed. You can view more details and manage your attendance from your UniHub dashboard.
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #F1F5F9;">
                        <p style="font-size: 12px; color: #94A3B8; margin: 0;">&copy; ${new Date().getFullYear()} UniHub University Platform. All Rights Reserved.</p>
                        <p style="font-size: 10px; color: #CBD5E1; margin-top: 5px;">This is an automated system node. Please do not reply to this email.</p>
                    </div>
                </div>
            `
        });

        // Check for overlapping events
        const userRegistrations = await Registration.find({ user: req.user._id, status: "Registered" }).populate("event");
        const overlappingEvents = userRegistrations
            .map(reg => reg.event)
            .filter(e => 
                e && 
                e._id.toString() !== event._id.toString() && 
                new Date(e.date).toDateString() === new Date(event.date).toDateString() &&
                e.time === event.time
            );

        if (overlappingEvents.length > 0) {
            return res.status(201).json({ 
                message: "Successfully registered! Warning: You have overlapping events at this time.", 
                overlappingEvents 
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

// @desc    Broadcast message to all registered participants
// @route   POST /api/events/:id/broadcast
// @access  Private (Organizer/Admin)
const broadcastMessage = async (req, res) => {
    try {
        const { message, type } = req.body;
        if (!message) return res.status(400).json({ message: "Message is required" });

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to send broadcasts for this event" });
        }

        const registrations = await Registration.find({ event: req.params.id, status: { $in: ["Registered", "Attended"] } });
        
        if (registrations.length === 0) {
            return res.status(400).json({ message: "No participants to message" });
        }

        const notifications = registrations.map(reg => ({
            recipient: reg.user,
            message: `[${event.title}] ${message}`,
            type: type || "Admin",
            event: event._id,
            actionUrl: `/events/${event._id}`
        }));

        await Notification.insertMany(notifications);

        await Log.create({
            user: req.user._id,
            actionType: "BROADCAST_SENT",
            details: `Sent broadcast to ${registrations.length} participants for event: ${event.title}`,
            event: event._id
        });

        res.json({ message: `Broadcast sent successfully to ${registrations.length} participants` });
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
    updateEventOverrides,
    broadcastMessage
};
