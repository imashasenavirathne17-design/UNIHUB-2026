const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getExams,
    createExam,
    updateExam,
    deleteExam,
    uploadPDF,
    generateQuestions
} = require('../controllers/OnExam_Controller');
const {
    getFolders,
    createFolder,
    deleteFolder,
    getPapersByFolder,
    uploadPaper,
    deletePaper
} = require('../controllers/OnExam_QuestionBankController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Multer Storage for Exam PDFs (AI Generation)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/exams';
        const fs = require('fs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `exam_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Multer Storage for Past Papers (Question Bank)
const paperStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/exams/pastpapers';
        const fs = require('fs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `paper_${Date.now()}_${file.originalname}`);
    }
});

const uploadPaperFiles = multer({
    storage: paperStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed for now'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Practice Exam Routes
router.get('/all', protect, getExams);
router.post('/upload-pdf', protect, authorize('lecturer', 'admin'), upload.single('pdf'), uploadPDF);
router.post('/generate-questions', protect, authorize('lecturer', 'admin'), generateQuestions);
router.post('/create', protect, authorize('lecturer', 'admin'), createExam);
router.put('/update/:id', protect, authorize('lecturer', 'admin'), updateExam);
router.delete('/delete/:id', protect, authorize('lecturer', 'admin'), deleteExam);

// Question Bank Routes
router.get('/folders', protect, getFolders);
router.post('/folders/create', protect, authorize('lecturer', 'admin'), createFolder);
router.delete('/folders/:id', protect, authorize('lecturer', 'admin'), deleteFolder);
router.get('/papers/:folderId', protect, getPapersByFolder);
router.post('/papers/upload', protect, authorize('lecturer', 'admin'), uploadPaperFiles.single('paper'), uploadPaper);
router.delete('/papers/:id', protect, authorize('lecturer', 'admin'), deletePaper);

module.exports = router;
