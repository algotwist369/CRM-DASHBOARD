const IpPageJourney = require('../models/IpPageJourney');

/**
 * Cleanup IpPageJourney records older than 8 days
 * This keeps the database size manageable and retains only recent tracking data
 */
const cleanupOldTrackingData = async () => {
    try {
        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
        eightDaysAgo.setHours(0, 0, 0, 0);

        console.log(`🧹 Running cleanup job - Deleting IpPageJourney records older than ${eightDaysAgo.toISOString()}`);

        const result = await IpPageJourney.deleteMany({
            lastVisitedAt: { $lt: eightDaysAgo }
        });

        console.log(`✅ Cleanup completed - Deleted ${result.deletedCount} old tracking records`);

        return {
            success: true,
            deletedCount: result.deletedCount,
            cutoffDate: eightDaysAgo
        };
    } catch (error) {
        console.error('❌ Error in cleanup job:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Run cleanup daily at midnight
const scheduleCleanupJob = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight

    const timeUntilMidnight = midnight - now;

    console.log(`⏰ Scheduling next cleanup job in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes`);

    setTimeout(() => {
        cleanupOldTrackingData();
        // Schedule next run (every 24 hours)
        setInterval(cleanupOldTrackingData, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
};

module.exports = {
    cleanupOldTrackingData,
    scheduleCleanupJob
};
