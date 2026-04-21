const OnExam_SubjectFolder = require('../models/OnExam_SubjectFolderModel');
const OnExam_PastPaper = require('../models/OnExam_PastPaperModel');
const path = require('path');
const fs = require('fs');

// @desc    Get all subject folders
// @route   GET /api/onexam/folders
const getFolders = async (req, res) => {
    try {
        const folders = await OnExam_SubjectFolder.find()
            .populate('created_by', 'name email');
        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new subject folder
// @route   POST /api/onexam/folders/create
const createFolder = async (req, res) => {
    try {
        const { subject_name } = req.body;
        if (!subject_name) {
            return res.status(400).json({ message: 'Subject name is required' });
        }

        const folderExists = await OnExam_SubjectFolder.findOne({ subject_name });
        if (folderExists) {
            return res.status(400).json({ message: 'Subject folder already exists' });
        }

        const folder = await OnExam_SubjectFolder.create({
            subject_name,
            created_by: req.user._id,
        });

        res.status(201).json(folder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a subject folder
// @route   DELETE /api/onexam/folders/:id
const deleteFolder = async (req, res) => {
    try {
        const folder = await OnExam_SubjectFolder.findById(req.params.id);
        if (!folder) return res.status(404).json({ message: 'Folder not found' });

        // Delete all papers associated with this folder
        const papers = await OnExam_PastPaper.find({ subject_folder_id: req.params.id });
        for (const paper of papers) {
            const filePath = path.resolve(process.cwd(), paper.file_url.startsWith('/') ? paper.file_url.slice(1) : paper.file_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await OnExam_PastPaper.deleteMany({ subject_folder_id: req.params.id });
        await folder.deleteOne();

        res.status(200).json({ message: 'Folder and all associated papers removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get papers by subject folder
// @route   GET /api/onexam/papers/:folderId
const getPapersByFolder = async (req, res) => {
    try {
        const papers = await OnExam_PastPaper.find({ subject_folder_id: req.params.folderId })
            .populate('uploaded_by', 'name email');
        res.status(200).json(papers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a past paper
// @route   POST /api/onexam/papers/upload
const uploadPaper = async (req, res) => {
    try {
        const { subject_folder_id, year, semester, title } = req.body;
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        if (!subject_folder_id || !year || !semester) {
            // Delete uploaded file if metadata is missing
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'All metadata fields are required' });
        }

        const paper = await OnExam_PastPaper.create({
            subject_folder_id,
            year,
            semester,
            title: title || `Past Paper ${year} ${semester}`,
            file_url: `/uploads/exams/pastpapers/${req.file.filename}`,
            file_size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
            uploaded_by: req.user._id,
        });

        res.status(201).json(paper);
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a past paper
// @route   DELETE /api/onexam/papers/:id
const deletePaper = async (req, res) => {
    try {
        const paper = await OnExam_PastPaper.findById(req.params.id);
        if (!paper) return res.status(404).json({ message: 'Paper not found' });

        const filePath = path.resolve(process.cwd(), paper.file_url.startsWith('/') ? paper.file_url.slice(1) : paper.file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await paper.deleteOne();
        res.status(200).json({ message: 'Paper removed and file deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFolders,
    createFolder,
    deleteFolder,
    getPapersByFolder,
    uploadPaper,
    deletePaper
};
