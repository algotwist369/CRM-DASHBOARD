const Lead = require("../models/Lead");
const Manager = require("../models/Manager");
const { sendLeadOnWhatsApp } = require("../services/whatsapp");
const logger = require("../utils/logger");

/**
 * Retry sending a lead to managers
 * Only sends to managers who haven't received it yet (based on failed_sends)
 */
const retrySendingLead = async (leadId, retryFailedOnly = true) => {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
        throw new Error("Lead not found");
    }

    // If already fully sent, return
    if (lead.sent) {
        return {
            status: "already_sent",
            message: "Lead already sent to all managers",
            sent_to_count: lead.sent_to_count,
        };
    }

    // Find managers for this location
    const managers = await Manager.find({ location: lead.location });

    if (!managers.length) {
        throw new Error(`No managers found for location: ${lead.location}`);
    }

    // Determine which managers to send to
    let managersToSend = managers;
    
    if (retryFailedOnly && lead.failed_sends && lead.failed_sends.length > 0) {
        // Only retry to managers who previously failed
        managersToSend = managers.filter(m => 
            lead.failed_sends.includes(m.whatsapp_number)
        );
    } else if (lead.sent_to_count > 0) {
        // If some were sent, only send to those who failed
        managersToSend = managers.filter(m => 
            lead.failed_sends && lead.failed_sends.includes(m.whatsapp_number)
        );
    }

    if (!managersToSend.length) {
        return {
            status: "no_managers_to_retry",
            message: "No managers to retry for this lead",
        };
    }

    logger.info(
        `Retrying lead ${lead.customer_name} - Sending to ${managersToSend.length} manager(s)`
    );

    // Send WhatsApp to managers
    const results = await Promise.allSettled(
        managersToSend.map((manager) =>
            sendLeadOnWhatsApp(manager.whatsapp_number, lead, true)
        )
    );

    const successful = [];
    const failed = [];

    results.forEach((result, index) => {
        const manager = managersToSend[index];
        if (result.status === "fulfilled") {
            successful.push(manager.whatsapp_number);
            logger.info(
                `✅ Retry successful: WhatsApp sent to ${manager.whatsapp_number} for lead: ${lead.customer_name}`
            );
        } else {
            failed.push(manager.whatsapp_number);
            const error = result.reason;
            logger.error(
                `❌ Retry failed for ${manager.whatsapp_number}:`,
                error?.message || "Unknown error"
            );
        }
    });

    // Update lead status
    // Remove successful sends from failed_sends list
    const updatedFailedSends = (lead.failed_sends || []).filter(
        num => !successful.includes(num)
    );
    
    // Add newly failed numbers (in case they weren't in the list before)
    failed.forEach(num => {
        if (!updatedFailedSends.includes(num)) {
            updatedFailedSends.push(num);
        }
    });

    lead.failed_sends = updatedFailedSends;
    lead.sent_to_count = (lead.sent_to_count || 0) + successful.length;

    // Check if all managers have now received it
    if (lead.sent_to_count === managers.length) {
        lead.sent = true;
        lead.sent_at = new Date();
        lead.failed_sends = [];
    } else {
        lead.sent = false;
    }

    await lead.save();

    return {
        status: successful.length > 0 ? (lead.sent ? "complete" : "partial") : "failed",
        sent_to_count: lead.sent_to_count,
        total_managers: managers.length,
        retried_to: managersToSend.length,
        successful_this_retry: successful.length,
        failed_this_retry: failed.length,
        failed_numbers: updatedFailedSends,
        is_complete: lead.sent,
    };
};

module.exports = {
    retrySendingLead,
};

