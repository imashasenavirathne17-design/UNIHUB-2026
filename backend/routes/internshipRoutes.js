const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/internshipController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Static paths first (before /:id)
router.get('/my-applications', protect, getMyApplications);
router.get('/saved', protect, getSavedInternships);
router.get('/org/dashboard', protect, authorize('organization', 'admin'), getOrgDashboard);
router.put('/applications/:appId/status', protect, authorize('organization', 'admin'), updateApplicationStatus);
router.put('/applications/:appId/withdraw', protect, withdrawApplication);

const upload = require('../utils/upload');

// Main routes
router.route('/')
    .get(protect, getAllInternships)
    .post(protect, authorize('organization', 'admin'), createInternship);

router.route('/:id')
    .get(protect, getInternshipById);

router.post('/:id/apply', protect, authorize('student'), upload.single('resume'), applyToInternship);
router.post('/:id/bookmark', protect, toggleBookmark);
router.get('/:id/applications', protect, authorize('organization', 'admin'), getApplicationsForInternship);

module.exports = router;
