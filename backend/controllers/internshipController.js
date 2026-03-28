const Internship = require('../models/Internship');
const Application = require('../models/Application');

// @desc    Create a new internship posting
// @route   POST /api/internships
// @access  Private (Organization, Admin)
const createInternship = async (req, res) => {
    try {
        const { title, company, location, type, description, requirements, skills, stipend, duration, deadline } = req.body;
        const internship = await Internship.create({
            postedBy: req.user._id,
            title, company, location, type, description,
            requirements: requirements || [],
            skills: skills || [],
            stipend, duration, deadline
        });
        res.status(201).json(internship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active internships (with optional query filters)
// @route   GET /api/internships
// @access  Private
const getAllInternships = async (req, res) => {
    try {
        const { type, skill, search } = req.query;
        const filter = { isActive: true };
        if (type) filter.type = type;
        if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
        if (search) filter.$or = [
            { title: new RegExp(search, 'i') },
            { company: new RegExp(search, 'i') },
        ];

        const internships = await Internship.find(filter)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(internships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get one internship by ID
// @route   GET /api/internships/:id
// @access  Private
const getInternshipById = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id).populate('postedBy', 'name email');
        if (!internship) return res.status(404).json({ message: 'Internship not found' });
        res.json(internship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply to an internship
// @route   POST /api/internships/:id/apply
// @access  Private (Student)
const applyToInternship = async (req, res) => {
    try {
        const { coverLetter } = req.body;
        const internshipId = req.params.id;
        const applicantId = req.user._id;

        const existing = await Application.findOne({ internshipId, applicantId });
        if (existing) return res.status(400).json({ message: 'You have already applied to this internship.' });

        const internship = await Internship.findById(internshipId);
        if (!internship || !internship.isActive) return res.status(404).json({ message: 'Internship not found or closed.' });

        let resumeData = null;
        if (req.file) {
            resumeData = {
                type: 'file',
                url: `/uploads/resumes/${req.file.filename}`
            };
        }

        const application = await Application.create({
            internshipId, applicantId, coverLetter, resumeData,
            statusHistory: [{ status: 'pending' }]
        });
        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Withdraw own application
// @route   PUT /api/internships/applications/:appId/withdraw
// @access  Private (Student)
const withdrawApplication = async (req, res) => {
    try {
        const application = await Application.findOneAndUpdate(
            { _id: req.params.appId, applicantId: req.user._id, status: 'pending' },
            {
                status: 'withdrawn',
                $push: { statusHistory: { status: 'withdrawn' } }
            },
            { new: true }
        );
        if (!application) return res.status(404).json({ message: 'Application not found or cannot be withdrawn.' });
        res.json({ message: 'Application withdrawn successfully.', application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in student's applications
// @route   GET /api/internships/my-applications
// @access  Private (Student)
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicantId: req.user._id })
            .populate('internshipId', 'title company location type deadline stipend')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all applications for an internship (org view)
// @route   GET /api/internships/:id/applications
// @access  Private (Organization)
const getApplicationsForInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ message: 'Internship not found' });
        if (internship.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const applications = await Application.find({ internshipId: req.params.id })
            .populate('applicantId', 'name email')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update application status + add org note
// @route   PUT /api/internships/applications/:appId/status
// @access  Private (Organization, Admin)
const updateApplicationStatus = async (req, res) => {
    try {
        const { status, orgNote } = req.body;
        const validStatuses = ['pending', 'shortlisted', 'accepted', 'rejected'];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status value' });

        const updateData = {
            status,
            $push: { statusHistory: { status, note: orgNote || '' } }
        };
        if (orgNote !== undefined) updateData.orgNote = orgNote;

        const application = await Application.findByIdAndUpdate(req.params.appId, updateData, { new: true })
            .populate('applicantId', 'name email')
            .populate('internshipId', 'title company');

        if (!application) return res.status(404).json({ message: 'Application not found' });
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Org Dashboard - get all internships posted by org + applicant counts
// @route   GET /api/internships/org/dashboard
// @access  Private (Organization, Admin)
const getOrgDashboard = async (req, res) => {
    try {
        const internships = await Internship.find({ postedBy: req.user._id }).sort({ createdAt: -1 });

        const dashboardData = await Promise.all(internships.map(async (job) => {
            const counts = await Application.aggregate([
                { $match: { internshipId: job._id } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);
            const statusMap = { pending: 0, shortlisted: 0, accepted: 0, rejected: 0 };
            counts.forEach(c => { statusMap[c._id] = c.count; });

            return {
                ...job.toObject(),
                applicantCounts: statusMap,
                totalApplicants: Object.values(statusMap).reduce((a, b) => a + b, 0),
            };
        }));

        res.json(dashboardData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle bookmark (save/unsave) an internship
// @route   POST /api/internships/:id/bookmark
// @access  Private
const toggleBookmark = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ message: 'Internship not found' });

        const userId = req.user._id;
        const isSaved = internship.savedBy.includes(userId);

        if (isSaved) {
            internship.savedBy = internship.savedBy.filter(id => id.toString() !== userId.toString());
        } else {
            internship.savedBy.push(userId);
        }
        await internship.save();
        res.json({ saved: !isSaved, savedCount: internship.savedBy.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in user's saved internships
// @route   GET /api/internships/saved
// @access  Private
const getSavedInternships = async (req, res) => {
    try {
        const internships = await Internship.find({ savedBy: req.user._id, isActive: true })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(internships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createInternship,
    getAllInternships,
    getInternshipById,
    applyToInternship,
    withdrawApplication,
    getMyApplications,
    getApplicationsForInternship,
    updateApplicationStatus,
    getOrgDashboard,
    toggleBookmark,
    getSavedInternships,
};
