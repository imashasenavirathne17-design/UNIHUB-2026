const OnExam = require('../models/OnExam_Model');
const path = require('path');
const fs = require('fs');
const { extractTextFromPDF } = require('../utils/OnExam_PDFService');
const { generateMCQsFromText } = require('../utils/OnExam_AIService');

// @desc    Upload PDF and Extract Text
// @route   POST /api/onexam/upload-pdf
const uploadPDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const filePath = `/uploads/exams/${req.file.filename}`;
        res.status(200).json({ pdfUrl: filePath });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate AI Questions from PDF
// @route   POST /api/onexam/generate-questions
const generateQuestions = async (req, res) => {
    try {
        const { pdfUrl, count, isRegen } = req.body;
        if (!pdfUrl) return res.status(400).json({ message: 'No PDF URL provided' });

        // Improve path resolution
        const cleanPdfUrl = pdfUrl.startsWith('/') ? pdfUrl.slice(1) : pdfUrl;
        const absolutePath = path.resolve(process.cwd(), cleanPdfUrl);
        
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ message: `PDF file not found on server` });
        }

        let text = "";
        try {
            text = await extractTextFromPDF(absolutePath);
            if (!text || text.trim().length < 50) {
                return res.status(422).json({ 
                    message: "The uploaded PDF doesn't contain enough selectable text." 
                });
            }
        } catch (pdfErr) {
            return res.status(500).json({ message: `PDF Text Extraction failed: ${pdfErr.message}` });
        }

        const questions = await generateMCQsFromText(text, count || 10, isRegen || false);
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all practice exams
// @route   GET /api/onexam/all
const getExams = async (req, res) => {
    try {
        const exams = await OnExam.find().populate('createdBy', 'name email');
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a practice exam
// @route   POST /api/onexam/create
const createExam = async (req, res) => {
    try {
        const { title, difficulty, duration, questions, pdfUrl } = req.body;

        if (!title || !difficulty || !questions || !duration) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const exam = await OnExam.create({
            title,
            difficulty,
            duration,
            questions, // Array of {question, options, answer}
            pdfUrl,
            createdBy: req.user._id,
        });

        res.status(201).json(exam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a practice exam
// @route   PUT /api/onexam/update/:id
const updateExam = async (req, res) => {
    try {
        const exam = await OnExam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // Check authorization: creator, admin, or any lecturer
        const isCreator = exam.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role.toLowerCase() === 'admin';
        const isLecturer = req.user.role.toLowerCase() === 'lecturer';

        if (!isCreator && !isAdmin && !isLecturer) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedExam = await OnExam.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedExam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a practice exam
// @route   DELETE /api/onexam/delete/:id
const deleteExam = async (req, res) => {
    try {
        const exam = await OnExam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // Check authorization: creator, admin, or any lecturer
        const isCreator = exam.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role.toLowerCase() === 'admin';
        const isLecturer = req.user.role.toLowerCase() === 'lecturer';

        if (!isCreator && !isAdmin && !isLecturer) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await exam.deleteOne();
        res.json({ message: 'Exam removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getExams,
    createExam,
    updateExam,
    deleteExam,
    uploadPDF,
    generateQuestions
};
