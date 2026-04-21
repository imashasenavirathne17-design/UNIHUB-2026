const EventRequest = require("../models/EventRequest");

// @desc    Submit an event request
// @route   POST /api/event-requests
// @access  Private (Student)
const createRequest = async (req, res) => {
    try {
        const { title, description, category } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        const request = await EventRequest.create({
            title,
            description,
            category,
            requestedBy: req.user._id
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active event requests
// @route   GET /api/event-requests
// @access  Private (Organizer/Admin)
const getRequests = async (req, res) => {
    try {
        // Return only Pending requests for organizers to review
        const requests = await EventRequest.find({ status: "Pending" })
            .populate("requestedBy", "name email")
            .sort({ createdAt: -1 });
            
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update request status (Approve/Reject)
// @route   PUT /api/event-requests/:id/status
// @access  Private (Organizer/Admin)
const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const request = await EventRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = status;
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRequest,
    getRequests,
    updateRequestStatus
};
