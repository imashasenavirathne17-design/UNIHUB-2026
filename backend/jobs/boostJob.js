const cron = require("node-cron");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Notification = require("../models/Notification");
const User = require("../models/User");

const startBoostJob = () => {
    // Run every hour
    cron.schedule("0 * * * *", async () => {
        console.log("🚀 Running Micro-Event Boost Mode System...");
        try {
            const now = new Date();
            const events = await Event.find({
                status: "Upcoming",
                capacity: { $lte: 50 },
                isBoosted: false
            });

            for (const event of events) {
                if (!event.manualOverride.boostModeEnabled) continue;

                const count = await Registration.countDocuments({ event: event._id, status: "Registered" });
                const fillRate = (count / event.capacity) * 100;
                const hoursToDeadline = (new Date(event.registrationDeadline) - now) / (1000 * 60 * 60);

                // Boost if fill rate < 30% and deadline is within 48h
                if (fillRate < 30 && hoursToDeadline < 48) {
                    console.log(`✨ Activating Boost Mode for event: ${event.title}`);
                    event.isBoosted = true;
                    event.isTrending = true;
                    event.boostActivationStatus = "Active";
                    await event.save();

                    // Send targeted promotional notifications to all students
                    const students = await User.find({ role: "student" });
                    const alreadyRegistered = await Registration.find({ event: event._id }).select("user");
                    const registeredIds = alreadyRegistered.map(r => r.user.toString());

                    const notifications = students
                        .filter(s => !registeredIds.includes(s._id.toString()))
                        .map(s => ({
                            recipient: s._id,
                            message: `🔥 Trending Event: '${event.title}' has limited spots left! Don't miss out - register before ${event.registrationDeadline.toLocaleDateString()}!`,
                            type: "Promotional",
                            event: event._id
                        }));

                    await Notification.insertMany(notifications);
                }
            }
        } catch (error) {
            console.error("❌ Error in boost job:", error.message);
        }
    });
};

module.exports = { startBoostJob };
