const mongoose = require('mongoose');
const Gig = require('../models/Gig');
require('dotenv').config({ path: '../.env' });

const checkDataTypes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/unihub");
        console.log("Connected to DB");

        const gigs = await Gig.find({});
        for (const gig of gigs) {
            console.log(`Gig: ${gig.title}`);
            console.log(`- userId Value: ${gig.userId}`);
            console.log(`- userId Type: ${typeof gig.userId}`);
            console.log(`- Is ObjectId: ${gig.userId instanceof mongoose.Types.ObjectId}`);
            console.log(`- String Version: "${gig.userId.toString()}"`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDataTypes();
