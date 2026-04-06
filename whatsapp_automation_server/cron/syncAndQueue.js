const cron = require("node-cron");
const { fetchGoogleSheetLeads } = require("../services/googleSheet");
const { validateAndSanitizePhone } = require("../utils/phoneValidator");
const leadQueue = require("../queue/leadQueue");
const Lead = require("../models/Lead"); // Import Lead model for duplicate check
const logger = require("../utils/logger");

// Prevent overlapping cron jobs
let isRunning = false;

/**
 * Fetch leads from Google Sheet and add them to queue for processing
 * This is now queue-based and can handle large volumes efficiently
 */
const syncAndQueueLeads = async () => {
    if (isRunning) {
        logger.warn("Previous sync job still running, skipping this execution");
        return { queued: 0, skipped: true };
    }

    isRunning = true;
    let queued = 0;
    let skipped = 0;
    let errors = 0;

    try {
        // Fetch leads from Google Sheet
        const rows = await fetchGoogleSheetLeads();
        logger.info(`📥 Fetched ${rows.length} rows from Google Sheet`);

        if (rows.length === 0) {
            return { queued: 0, total_fetched: 0 };
        }

        // 1. Filter and Sanitize Rows
        const validRows = rows.map(row => {
            const customer_name = row.customer_name || "";
            const location = row.location?.toLowerCase().trim();
            const customer_phone = row.customer_phone?.trim();

            if (!location || !customer_phone) return null;

            const sanitizedPhone = validateAndSanitizePhone(customer_phone);
            if (!sanitizedPhone) return null;

            return { customer_name, location, customer_phone: sanitizedPhone };
        }).filter(Boolean);

        skipped += (rows.length - validRows.length);

        // 2. Batch Processing to reduce DB/Redis roundtrips
        const batchSize = 50;
        for (let i = 0; i < validRows.length; i += batchSize) {
            const batch = validRows.slice(i, i + batchSize);
            
            // Organize batch by location for targeted DB queries
            const locationToPhones = {};
            batch.forEach(item => {
                if (!locationToPhones[item.location]) locationToPhones[item.location] = [];
                locationToPhones[item.location].push(item.customer_phone);
            });

            // Parallel DB checks for all locations in the batch
            const existingLeadSets = await Promise.all(
                Object.keys(locationToPhones).map(async (loc) => {
                    const existing = await Lead.find({
                        location: loc,
                        customer_phone: { $in: locationToPhones[loc] }
                    }).select('location customer_phone -_id');
                    
                    const set = new Set(existing.map(l => `${l.location}_${l.customer_phone}`));
                    return set;
                })
            );

            // Merge sets
            const allExistingLeads = new Set();
            existingLeadSets.forEach(set => set.forEach(val => allExistingLeads.add(val)));

            // 3. Prepare jobs for bulk addition
            const jobsToQueue = batch
                .filter(item => !allExistingLeads.has(`${item.location}_${item.customer_phone}`))
                .map(item => ({
                    name: "__default__", // Default unnamed job
                    data: {
                        customer_name: item.customer_name,
                        location: item.location,
                        customer_phone: item.customer_phone
                    },
                    opts: {
                        priority: 1,
                        jobId: `${item.location}_${item.customer_phone}`,
                        removeOnComplete: true
                    }
                }));

            if (jobsToQueue.length > 0) {
                try {
                    await leadQueue.addBulk(jobsToQueue);
                    queued += jobsToQueue.length;
                    logger.info(`✅ Batched ${jobsToQueue.length} NEW leads into queue`);
                } catch (bulkError) {
                    // Handle partial failure or bulk errors
                    logger.error(`Error in bulk queue addition: ${bulkError.message}`);
                    errors += jobsToQueue.length;
                }
            }

            skipped += (batch.length - jobsToQueue.length);
        }

        const result = {
            queued,
            skipped,
            errors,
            total_fetched: rows.length,
        };

        logger.info(`✅ Sync completed: ${queued} new leads queued in batches`);
        return result;
    } catch (error) {
        logger.error("Sync job failed:", error.message, error);
        throw error;
    } finally {
        isRunning = false;
    }
};

/**
 * CRON: Runs every 1 minute
 * Fetches leads from Google Sheet and adds them to queue
 */
cron.schedule("*/1 * * * *", async () => {
    logger.info("⏳ Running Google Sheet sync - adding leads to queue...");
    try {
        const result = await syncAndQueueLeads();
        logger.info("Cron completed:", result);
    } catch (error) {
        logger.error("Cron job failed:", error.message);
    }
});

module.exports = { syncAndQueueLeads };
