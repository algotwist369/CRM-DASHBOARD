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

        for (const row of rows) {
            try {
                const customer_name = row.customer_name || "";
                const location = row.location?.toLowerCase().trim();
                const customer_phone = row.customer_phone?.trim();

                // Validate required fields
                if (!location || !customer_phone) {
                    skipped++;
                    continue;
                }

                // Validate and sanitize phone number
                const sanitizedPhone = validateAndSanitizePhone(customer_phone);
                if (!sanitizedPhone) {
                    logger.warn(`Invalid phone number format: ${customer_phone}`);
                    skipped++;
                    continue;
                }

                // CRITICAL: Check if lead already exists in DB
                // If it exists, we strictly skip it to prevent duplicates/spam
                const exists = await Lead.exists({
                    location: location,
                    customer_phone: sanitizedPhone
                });

                if (exists) {
                    continue; // Silent skip as this is expected for most rows
                }

                // Generate unique job ID WITHOUT timestamp
                const jobId = `${location}_${sanitizedPhone}`;

                // Add lead to queue for processing
                // USING DEFAULT (UNNAMED) JOB to ensure worker picks it up
                const job = await leadQueue.add(
                    {
                        customer_name,
                        location,
                        customer_phone: sanitizedPhone,
                    },
                    {
                        // Job options
                        priority: 1, // Default priority
                        jobId: jobId, // Unique ID
                        removeOnComplete: true,
                    }
                );

                queued++;
                logger.info(`Queued NEW lead: ${customer_name} - ${location}`);
            } catch (error) {
                // Check if it's a duplicate job error
                if (error.message?.includes("already exists") || error.message?.includes("JobId")) {
                    // Job already in queue - expected behavior
                    skipped++;
                } else {
                    errors++;
                    logger.error(`Error queueing lead: ${error.message}`);
                }
            }
        }

        const result = {
            queued,
            skipped,
            errors,
            total_fetched: rows.length,
        };

        logger.info(`✅ Sync completed: ${queued} new leads queued`);
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
