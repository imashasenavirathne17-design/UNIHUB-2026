const Issue = require('../models/labhallsystem_Issue');
const Room = require('../models/labhallsystem_Room');

exports.reportIssue = async (req, res) => {
    try {
        const { roomId, description, priority } = req.body;
        const newIssue = new Issue({
            roomId,
            reportedBy: req.user._id,
            description,
            priority
        });
        await newIssue.save();
        res.status(201).json(newIssue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find()
            .populate('roomId')
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateIssueStatus = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });
        
        issue.status = req.body.status;
        await issue.save();
        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getIssueStats = async (req, res) => {
    try {
        const total = await Issue.countDocuments();
        const open = await Issue.countDocuments({ status: 'open' });
        const critical = await Issue.countDocuments({ priority: 'critical' });
        res.json({ total, open, critical });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
