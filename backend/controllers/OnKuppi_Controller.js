const KuppiSession = require('../models/OnKuppi_SessionModel');
const fs = require('fs');
const path = require('path');

// @desc    Get all Kuppi sessions
// @route   GET /api/kuppi
const getSessions = async (req, res) => {
    try {
        const sessions = await KuppiSession.find()
            .populate('created_by', 'name email role')
            .sort({ date: 1, time: 1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new Kuppi session
// @route   POST /api/kuppi
const createSession = async (req, res) => {
    try {
        const { subject, year, semester, date, time, description, teams_link } = req.body;
        
        let file_url = '';
        if (req.file) {
            file_url = `/uploads/kuppi/${req.file.filename}`;
        }

        const session = await KuppiSession.create({
            subject,
            year,
            semester,
            date,
            time,
            description,
            teams_link,
            file_url,
            created_by: req.user._id,
        });

        res.status(201).json(session);
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a Kuppi session
// @route   PUT /api/kuppi/:id
const updateSession = async (req, res) => {
    try {
        const session = await KuppiSession.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Ownership check: creator or lecturer/admin
        const isOwner = session.created_by.toString() === req.user._id.toString();
        const isAdmin = ['admin', 'lecturer'].includes(req.user.role.toLowerCase());

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this session' });
        }

        if (req.file) {
            // Delete old file if exists
            if (session.file_url) {
                const oldPath = path.join(process.cwd(), session.file_url.startsWith('/') ? session.file_url.slice(1) : session.file_url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            req.body.file_url = `/uploads/kuppi/${req.file.filename}`;
        }

        const updatedSession = await KuppiSession.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedSession);
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a Kuppi session
// @route   DELETE /api/kuppi/:id
const deleteSession = async (req, res) => {
    try {
        const session = await KuppiSession.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Ownership check: creator or lecturer/admin
        const isOwner = session.created_by.toString() === req.user._id.toString();
        const isAdmin = ['admin', 'lecturer'].includes(req.user.role.toLowerCase());

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this session' });
        }

        // Delete associated file
        if (session.file_url) {
            const filePath = path.join(process.cwd(), session.file_url.startsWith('/') ? session.file_url.slice(1) : session.file_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await session.deleteOne();
        res.json({ message: 'Session removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSessions,
    createSession,
    updateSession,
    deleteSession,
};
