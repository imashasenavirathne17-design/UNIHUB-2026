const mongoose = require('mongoose');
const User = require('../models/User');
const SkillProfile = require('../models/SkillProfile');
const Gig = require('../models/Gig');
require('dotenv').config({ path: '../.env' });

const checkAccounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/unihub");
        console.log("Connected to DB");

        const users = await User.find({});
        console.log(`\n--- ALL USERS (${users.length}) ---`);
        for (const user of users) {
             const profile = await SkillProfile.findOne({ userId: user._id });
             const gigsCount = await Gig.countDocuments({ userId: user._id });
             console.log(`User: ${user.name} | ID: ${user._id} | Role: ${user.role} | ProfileExists: ${!!profile} | Gigs: ${gigsCount}`);
        }

        console.log("\n--- RECENT GIGS ---");
        const gigs = await Gig.find({}).limit(5);
        for (const gig of gigs) {
            console.log(`Gig: ${gig.title} | UserID: ${gig.userId}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAccounts();
