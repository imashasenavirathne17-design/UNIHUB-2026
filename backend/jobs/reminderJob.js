const cron = require("node-cron");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Notification = require("../models/Notification");

const startReminderJob = () => {
    // Run every 15 minutes
    cron.schedule("*/15 * * * *", async () => {
        console.log("⏰ Running Smart Multi-Stage Reminder System...");
        try {
            const now = new Date();
            const events = await Event.find({ status: "Upcoming" });

            for (const event of events) {
                if (!event.manualOverride.remindersEnabled) continue;

                const registrations = await Registration.find({ event: event._id, status: "Registered" });
                const timeDiffDays = (new Date(event.date) - now) / (1000 * 60 * 60 * 24);

                const thresholds = [
                    { label: "3d", value: 3 },
                    { label: "1d", value: 1 },
                    { label: "3h", value: 0.125 },
                    { label: "30m", value: 0.02 }
                ];

                for (const threshold of thresholds) {
                    // If we are within the threshold window and haven't notified for this stage yet
                    if (timeDiffDays <= threshold.value && timeDiffDays > 0) {
                        for (const reg of registrations) {
                            if (!reg.notified.get(threshold.label)) {
                                // Send notification
                                await Notification.create({
                                    recipient: reg.user,
                                    message: `Reminder: The event '${event.title}' is starting in approximately ${threshold.label}!`,
                                    type: "Reminder",
                                    event: event._id
                                });

                                // Mark as notified
                                reg.notified.set(threshold.label, true);
                                await reg.save();
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("❌ Error in reminder job:", error.message);
        }
    });
};

module.exports = { startReminderJob };
