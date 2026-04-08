const cron = require("node-cron");
const Lead = require("../models/Lead");
const Manager = require("../models/Manager");
const { fetchGoogleSheetLeads } = require("../services/googleSheet");
const { sendLeadOnWhatsApp } = require("../services/whatsapp");
const { validateAndSanitizePhone } = require("../utils/phoneValidator");
const logger = require("../utils/logger");
// Note: dotenv is loaded in server.js, no need to load here

// Prevent overlapping cron jobs
let isRunning = false;

/**
 * Send WhatsApp messages to managers in parallel with rate limiting
 */
const sendToManagers = async (managers, lead) => {
    const results = await Promise.allSettled(
        managers.map((manager) =>
            sendLeadOnWhatsApp(manager.whatsapp_number, lead, true)
        )
    );

    const successful = [];
    const failed = [];

    // Process results and track successful/failed sends
    results.forEach((result, index) => {
        const manager = managers[index];
        if (result.status === "fulfilled") {
            successful.push(manager.whatsapp_number);
            logger.info(
                `✅ WhatsApp sent successfully to ${manager.whatsapp_number} for lead: ${lead.customer_name}`
            );
        } else {
            failed.push(manager.whatsapp_number);
            const error = result.reason;
            logger.error(
                `❌ WhatsApp send FAILED for manager ${manager.whatsapp_number}:`,
                error?.message || "Unknown error",
                error?.code || "",
                error?.moreInfo || ""
            );
        }
    });

    return {
        successful: successful.length,
        failed: failed,
        successfulNumbers: successful, // Track which numbers succeeded
    };
};

/**
 * Core logic:
 * 1. Fetch public Google Sheet
 * 2. Save new leads (ignore duplicates)
 * 3. Send WhatsApp to all managers of same location
 * 4. Update lead status and sent_to_count
 */
const syncAndSendLeads = async () => {
    if (isRunning) {
        logger.warn("Previous sync job still running, skipping this execution");
        return { processed_leads: 0, whatsapp_sent: 0, skipped: true };
    }

    isRunning = true;
    let processed = 0;
    let sent = 0;
    let errors = 0;
    let skippedNoManagers = 0;

    try {
        // Fetch leads from Google Sheet
        const rows = await fetchGoogleSheetLeads();
        logger.info(`Fetched ${rows.length} rows from Google Sheet`);

        // Cache managers by location to avoid repeated queries
        const managerCache = new Map();

        for (const row of rows) {
            try {
                const customer_name = row.customer_name || "";
                const location = row.location?.toLowerCase().trim();
                const customer_phone = row.customer_phone?.trim();

                // Validate required fields
                if (!location || !customer_phone) {
                    logger.warn(
                        `Skipping row with missing location or phone: ${JSON.stringify(row)}`
                    );
                    continue;
                }

                // Validate and sanitize phone number
                const sanitizedPhone = validateAndSanitizePhone(customer_phone);
                if (!sanitizedPhone) {
                    logger.warn(
                        `Invalid phone number format: ${customer_phone}`
                    );
                    continue;
                }

                let lead;
                try {
                    // Insert only if not exists (case-insensitive location)
                    lead = await Lead.findOneAndUpdate(
                        { location: location.toLowerCase(), customer_phone: sanitizedPhone },
                        {
                            $setOnInsert: {
                                customer_name: customer_name,
                                location: location.toLowerCase(),
                                customer_phone: sanitizedPhone,
                            },
                        },
                        { upsert: true, new: true }
                    );
                } catch (err) {
                    // Duplicate key error or other DB error
                    if (err.code === 11000) {
                        // Lead already exists, fetch it
                        lead = await Lead.findOne({
                            location: location.toLowerCase(),
                            customer_phone: sanitizedPhone,
                        });
                    } else {
                        logger.error(`Database error for lead: ${err.message}`);
                        errors++;
                        continue;
                    }
                }

                // If already sent, skip
                if (lead.sent) {
                    continue;
                }

                // Find managers for this location (use cache)
                let managers;
                if (managerCache.has(location)) {
                    managers = managerCache.get(location);
                } else {
                    managers = await Manager.find({
                        location: location.toLowerCase(),
                    });
                    managerCache.set(location, managers);
                }

                if (!managers.length) {
                    logger.warn(
                        `No managers found for location: ${location}. Lead will be skipped.`
                    );
                    skippedNoManagers++;
                    // Don't mark as sent if no managers - allows retry when managers are added
                    continue;
                }

                // Send WhatsApp to all managers in parallel
                const sendResult = await sendToManagers(managers, lead);

                // Track successful and failed sends
                lead.sent_to_count = sendResult.successful;
                lead.failed_sends = sendResult.failed || [];

                // Only mark as sent if ALL managers received it
                if (sendResult.successful === managers.length) {
                    lead.sent = true;
                    lead.sent_at = new Date();
                    logger.info(
                        `✅ All ${sendResult.successful} managers received lead: ${lead.customer_name}`
                    );
                } else {
                    // Partial success - keep sent=false to allow retry
                    lead.sent = false;
                    if (sendResult.successful > 0) {
                        logger.warn(
                            `⚠️ Partial send: ${sendResult.successful}/${managers.length} managers received lead: ${lead.customer_name}`
                        );
                    } else {
                        logger.error(
                            `❌ All sends failed for lead: ${lead.customer_name}`
                        );
                    }
                }

                await lead.save();

                processed++;
                sent += sendResult.successful;
            } catch (err) {
                logger.error(`Error processing lead: ${err.message}`, err);
                errors++;
            }
        }

        const result = {
            processed_leads: processed,
            whatsapp_sent: sent,
            errors,
            skipped_no_managers: skippedNoManagers,
        };

        logger.info("Sync completed:", result);
        return result;
    } catch (error) {
        logger.error("Sync job failed:", error.message, error);
        throw error;
    } finally {
        isRunning = false;
    }
};

/**
 * CRON: Runs every 5 minutes (as per requirements)
 */
cron.schedule("*/5 * * * *", async () => {
    logger.info("⏳ Running Google Sheet sync & WhatsApp send...");
    try {
        const result = await syncAndSendLeads();
        logger.info("Cron completed:", result);
    } catch (error) {
        logger.error("Cron job failed:", error.message, error);
    }
});

module.exports = {
    syncAndSendLeads,
};
