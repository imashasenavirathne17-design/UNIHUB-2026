const cron = require('node-cron');
const Internship = require('../models/Internship');

// Runs every day at midnight (00:00)
// Automatically closes internships past their deadline
const startExpiryJob = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const now = new Date();
            const result = await Internship.updateMany(
                { isActive: true, deadline: { $lt: now } },
                { $set: { isActive: false } }
            );
            if (result.modifiedCount > 0) {
                console.log(`[Cron] Auto-closed ${result.modifiedCount} expired internship(s).`);
            }
        } catch (err) {
            console.error('[Cron] Error closing expired internships:', err.message);
        }
    });

    console.log('[Cron] Internship expiry job scheduled (daily at midnight).');
};

module.exports = { startExpiryJob };
