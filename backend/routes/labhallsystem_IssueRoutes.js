const express = require('express');
const router = express.Router();
const { 
    reportIssue, 
    getAllIssues, 
    updateIssueStatus, 
    getIssueStats 
} = require('../controllers/labhallsystem_IssueController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, reportIssue);
router.get('/', protect, getAllIssues);
router.get('/stats', protect, getIssueStats);
router.put('/:id', protect, updateIssueStatus);

module.exports = router;
