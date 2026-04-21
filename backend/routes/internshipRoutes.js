const express = require('express');
const router = express.Router();
const {
    createInternship,
    getAllInternships,
    getInternshipById,
    applyToInternship,
    withdrawApplication,
    updateApplication,
    deleteApplication,
    getMyApplications,
    getApplicationsForInternship,
    updateApplicationStatus,
    getOrgDashboard,
    toggleBookmark,
    getSavedInternships,
    updateInternship,
    deleteInternship,
    getOrCreateInternshipConversation,
    getInternshipMessages,
    sendInternshipMessage
} = require('../controllers/internshipController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Static paths first (before /:id)
router.get('/my-applications', protect, getMyApplications);
router.get('/saved', protect, getSavedInternships);
const upload = require('../utils/upload');

router.get('/org/dashboard', protect, authorize('organization', 'admin'), getOrgDashboard);
router.put('/applications/:appId/status', protect, authorize('organization', 'admin'), updateApplicationStatus);
router.put('/applications/:appId/withdraw', protect, withdrawApplication);
router.put('/applications/:appId', protect, upload.single('resume'), updateApplication);
router.delete('/applications/:appId', protect, deleteApplication);
// Chat routes (internship-scoped)
router.post('/chat/conversation', protect, getOrCreateInternshipConversation);
router.get('/chat/messages/:conversationId', protect, getInternshipMessages);
router.post('/chat/messages', protect, sendInternshipMessage);

// Main routes
router.route('/')
    .get(protect, getAllInternships)
    .post(protect, authorize('organization', 'admin'), createInternship);

router.route('/:id')
    .get(protect, getInternshipById)
    .put(protect, authorize('organization', 'admin'), updateInternship)
    .delete(protect, authorize('organization', 'admin'), deleteInternship);

router.post('/:id/apply', protect, authorize('student'), upload.single('resume'), applyToInternship);
router.post('/:id/bookmark', protect, toggleBookmark);
router.get('/:id/applications', protect, authorize('organization', 'admin'), getApplicationsForInternship);

module.exports = router;
