const Lead = require("../models/Lead");
const Manager = require("../models/Manager");
const { sendLeadOnWhatsApp } = require("../services/whatsapp");
const { validateAndSanitizePhone } = require("../utils/phoneValidator");
const { checkDuplicateLead } = require("../utils/duplicateChecker");
const logger = require("../utils/logger");

/**
 * Process a single lead: Save to DB and send to managers
 */
const processLead = async (job) => {
    const { customer_name, location, customer_phone } = job.data;
    await job.progress(10); // 10% - Started
    logger.info(`Processing lead: ${customer_name} (${location})`);

    try {
        // Validate and sanitize phone number
        const sanitizedPhone = validateAndSanitizePhone(customer_phone);
        if (!sanitizedPhone) {
            throw new Error(`Invalid phone number format: ${customer_phone}`);
        }
        await job.progress(20); // 20% - Validated

        const normalizedLocation = location?.toLowerCase().trim();

        // Check for duplicate within 24 hours for same location
        const duplicateCheck = await checkDuplicateLead(normalizedLocation, sanitizedPhone, 24);
        await job.progress(30); // 30% - Checked duplicates

        let lead = null;

        if (duplicateCheck.isDuplicate) {
            // Duplicate found within 24h - use existing lead
            lead = duplicateCheck.existingLead;

            // If the existing lead is already sent, skip processing
            if (lead && lead.sent) {
                logger.debug(
                    `Duplicate lead skipped (already sent): ${customer_name} - ${sanitizedPhone}`
                );
                return {
                    status: "skipped",
                    reason: "duplicate_already_sent",
                    hoursAgo: duplicateCheck.hoursAgo,
                };
            }

            // Duplicate exists but not sent - use existing lead to process
            logger.info(
                `Processing existing lead (not sent yet): ${customer_name} - ${normalizedLocation}`
            );
        } else {
            // No duplicate within 24h - try to find or create
            // This Handles race conditions where sync might have created it after our check
            lead = await Lead.findOneAndUpdate(
                { location: normalizedLocation, customer_phone: sanitizedPhone },
                {
                    $setOnInsert: {
                        customer_name: customer_name || "",
                        location: normalizedLocation,
                        customer_phone: sanitizedPhone,
                    },
                },
                { upsert: true, new: true }
            );

            if (lead.createdAt > new Date(Date.now() - 5000)) {
                logger.info(`New lead created: ${customer_name} - ${normalizedLocation}`);
            }
        }
        await job.progress(50); // 50% - Lead DB Op Done

        // Double check sent status
        if (lead.sent) {
            return { status: "skipped", reason: "already_sent" };
        }

        // Find managers for this location
        // Use exact match on lowercase location
        const managers = await Manager.find({ location: normalizedLocation });
        await job.progress(60); // 60% - Managers Found

        if (!managers.length) {
            // CRITICAL LOG: This helps debug why managers aren't getting messages
            logger.error(`NO MANAGERS FOUND for location: '${normalizedLocation}'. Lead ${customer_name} will NOT be sent.`);
            return {
                status: "skipped",
                reason: "no_managers",
                location: normalizedLocation,
            };
        } else {
            logger.info(`Found ${managers.length} managers for location '${normalizedLocation}'`);
        }

        // Send WhatsApp to all managers in parallel
        logger.info(`Sending WhatsApp to ${managers.length} managers...`);
        const results = await Promise.allSettled(
            managers.map((manager) =>
                sendLeadOnWhatsApp(manager.whatsapp_number, lead, true)
            )
        );
        await job.progress(90); // 90% - WhatsApp API calls done

        const successful = [];
        const failed = [];

        results.forEach((result, index) => {
            const manager = managers[index];
            if (result.status === "fulfilled") {
                successful.push(manager.whatsapp_number);
                logger.info(
                    `WhatsApp sent to ${manager.whatsapp_number} for lead: ${customer_name}`
                );
            } else {
                failed.push(manager.whatsapp_number);
                const error = result.reason;
                logger.error(
                    `WhatsApp send failed for ${manager.whatsapp_number}:`,
                    error?.message || "Unknown error"
                );
            }
        });

        // Update lead status
        lead.sent_to_count = successful.length;
        lead.failed_sends = failed;

        if (successful.length === managers.length) {
            lead.sent = true;
            lead.sent_at = new Date();
            lead.failed_sends = [];
        } else {
            lead.sent = false; // Keep false to allow retry
        }

        await lead.save();
        await job.progress(100); // 100% - Done

        return {
            status: successful.length > 0 ? "partial" : "failed",
            sent_to_count: successful.length,
            total_managers: managers.length,
            failed_count: failed.length,
            failed_numbers: failed,
        };
    } catch (error) {
        logger.error(`Error processing lead ${customer_name}:`, error.message);
        throw error; // Re-throw to mark job as failed
    }
};

module.exports = { processLead };

