const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getSessions,
    createSession,
    updateSession,
    deleteSession,
} = require('../controllers/OnKuppi_Controller');
const { protect, authorize } = require('../middleware/authMiddleware');

// Multer Storage for Kuppi Materials
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/kuppi';
        const fs = require('fs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `kuppi_${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only PDF and DOCX files are allowed'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Routes
router.get('/', protect, getSessions);
router.post('/', protect, authorize('student', 'lecturer', 'admin'), upload.single('material'), createSession);
router.put('/:id', protect, authorize('student', 'lecturer', 'admin'), upload.single('material'), updateSession);
router.delete('/:id', protect, authorize('student', 'lecturer', 'admin'), deleteSession);

module.exports = router;
