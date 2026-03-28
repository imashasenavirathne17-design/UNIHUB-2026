const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const checkGigs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/unihub");
        console.log("Connected to DB");

        const gigs = await Gig.find({});
        console.log(`Total Gigs: ${gigs.length}`);

        for (const gig of gigs) {
            const user = await User.findById(gig.userId);
            console.log(`Gig: ${gig.title} | ID: ${gig._id} | UserID: ${gig.userId} | UserName: ${user ? user.name : 'Unknown'}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkGigs();
