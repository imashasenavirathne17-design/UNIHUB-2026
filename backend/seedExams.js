const mongoose = require('mongoose');
require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const OnExam = require('./models/OnExam_Model');
const User = require('./models/User');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Find a lecturer or admin to be the creator
        let creator = await User.findOne({ role: 'lecturer' });
        if (!creator) creator = await User.findOne({ role: 'admin' });
        
        if (!creator) {
            console.log("No lecturer or admin found. Create one first or use a student ID.");
            process.exit(1);
        }

        const mockQuestions = [
            { question: "What is the primary function of this subject?", options: ["Function A", "Function B", "Function C", "Function D"], answer: "Function A" },
            { question: "Which layer is responsible for routing?", options: ["Physical", "Data Link", "Network", "Transport"], answer: "Network" }
        ];

        const exams = [
            { title: 'Computer Networks', duration: 45, difficulty: 'Hard', questions: mockQuestions, createdBy: creator._id },
            { title: 'Software Engineering', duration: 30, difficulty: 'Medium', questions: mockQuestions, createdBy: creator._id },
            { title: 'Database Systems', duration: 60, difficulty: 'Easy', questions: mockQuestions, createdBy: creator._id },
            { title: 'OSSA', duration: 40, difficulty: 'Medium', questions: mockQuestions, createdBy: creator._id },
            { title: 'NDM', duration: 50, difficulty: 'Hard', questions: mockQuestions, createdBy: creator._id },
            { title: 'PAF', duration: 45, difficulty: 'Easy', questions: mockQuestions, createdBy: creator._id },
        ];

        await OnExam.deleteMany({});
        await OnExam.insertMany(exams);

        console.log("Seed successful! Added 6 practice exams.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
