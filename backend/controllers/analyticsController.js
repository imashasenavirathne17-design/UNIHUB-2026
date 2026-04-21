const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Log = require("../models/Log");

// @desc    Get organizer-specific aggregate analytics
// @route   GET /api/analytics/events/organizer
// @access  Private (Organizer/Admin)
const getOrganizerAnalytics = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { organizer: req.user._id };
        const events = await Event.find(query);
        
        const eventStats = await Promise.all(events.map(async (e) => {
            const registered = await Registration.countDocuments({ event: e._id, status: { $in: ["Registered", "Attended"] } });
            const attended = await Registration.countDocuments({ event: e._id, attended: true });
            
            return {
                _id: e._id,
                title: e.title,
                registeredCount: registered,
                attendedCount: attended,
                capacity: e.capacity,
                category: e.category,
                status: e.status,
                date: e.date
            };
        }));
        
        const totalEvents = events.length;
        const totalRegistrations = eventStats.reduce((acc, curr) => acc + curr.registeredCount, 0);
        const totalAttended = eventStats.reduce((acc, curr) => acc + curr.attendedCount, 0);
        const totalCapacity = eventStats.reduce((acc, curr) => acc + curr.capacity, 0);
        
        const averageAttendanceRate = totalRegistrations > 0 ? (totalAttended / totalRegistrations) * 100 : 0;
        const averageFillRate = totalCapacity > 0 ? (totalRegistrations / totalCapacity) * 100 : 0;
        
        res.json({
            totalEvents,
            totalRegistrations,
            totalAttended,
            averageAttendanceRate: averageAttendanceRate.toFixed(1),
            averageFillRate: averageFillRate.toFixed(1),
            events: eventStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get global event analytics
// @route   GET /api/analytics/events/global
// @access  Private (Admin)
const getGlobalEventAnalytics = async (req, res) => {
    try {
        const events = await Event.find({});
        const registrations = await Registration.find({ status: "Registered" });
        
        const totalEvents = events.length;
        const totalRegistrations = registrations.length;
        
        let fillRateSum = 0;
        
        const eventStats = await Promise.all(events.map(async (e) => {
            const count = await Registration.countDocuments({ event: e._id, status: "Registered" });
            const fill = e.capacity > 0 ? (count / e.capacity) * 100 : 0;
            fillRateSum += fill;
            
            return {
                _id: e._id,
                title: e.title,
                registeredCount: count,
                capacity: e.capacity,
                category: e.category,
                status: e.status
            };
        }));
        
        const averageFillRate = totalEvents > 0 ? (fillRateSum / totalEvents).toFixed(1) : 0;
        const uniqueOrganizers = new Set(events.map(e => e.organizer.toString())).size;
        
        res.json({
            totalEvents,
            totalRegistrations,
            averageFillRate,
            uniqueOrganizers,
            events: eventStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific event analytics
// @route   GET /api/analytics/events/:id
// @access  Private (Organizer/Admin)
const getEventAnalytics = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const registrations = await Registration.countDocuments({ event: req.params.id, status: "Registered" });
        const attendance = await Registration.countDocuments({ event: req.params.id, attended: true });

        res.json({
            eventId: event._id,
            title: event.title,
            capacity: event.capacity,
            registered: registrations,
            attended: attendance,
            fillRate: (registrations / event.capacity) * 100,
            attendanceRate: registrations > 0 ? (attendance / registrations) * 100 : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Risk Detection Dashboard
// @route   GET /api/analytics/risk-detection
// @access  Private (Admin)
const getRiskDetection = async (req, res) => {
    try {
        // High risk: < 20% registration within 48h of deadline
        // Medium risk: < 50% registration within 72h of deadline
        const now = new Date();
        const upcomingDeadlineLimit = new Date(now.getTime() + 72 * 60 * 60 * 1000);

        const events = await Event.find({
            registrationDeadline: { $lte: upcomingDeadlineLimit },
            status: "Upcoming"
        });

        const riskData = await Promise.all(events.map(async event => {
            const count = await Registration.countDocuments({ event: event._id, status: "Registered" });
            const fillRate = (count / event.capacity) * 100;
            const hoursToDeadline = (new Date(event.registrationDeadline) - now) / (1000 * 60 * 60);

            let riskLevel = "Low";
            let alertMessage = "";

            if (fillRate < 20 && hoursToDeadline < 48) {
                riskLevel = "High";
                alertMessage = "Critically low registrations near deadline";
            } else if (fillRate < 50 && hoursToDeadline < 72) {
                riskLevel = "Medium";
                alertMessage = "Low engagement detected";
            }

            return {
                eventId: event._id,
                title: event.title,
                registrationDeadline: event.registrationDeadline,
                fillRate,
                riskLevel,
                alertMessage
            };
        }));

        res.json(riskData.filter(r => r.riskLevel !== "Low"));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Audit Trail Logs
// @route   GET /api/analytics/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res) => {
    try {
        const logs = await Log.find({})
            .sort({ createdAt: -1 })
            .populate("user", "name role")
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getGlobalEventAnalytics,
    getOrganizerAnalytics,
    getEventAnalytics,
    getRiskDetection,
    getAuditLogs
};
