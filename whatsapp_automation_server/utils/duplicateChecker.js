const Lead = require("../models/Lead");
const logger = require("../utils/logger");

/**
 * Check if a lead is a duplicate within 24 hours for the same location
 * Returns: { isDuplicate: boolean, existingLead: Lead | null }
 */
const checkDuplicateLead = async (location, customerPhone, hoursThreshold = 24) => {
    try {
        const normalizedLocation = location?.toLowerCase().trim();
        
        // Find leads with same location and phone
        const existingLeads = await Lead.find({
            location: normalizedLocation,
            customer_phone: customerPhone,
        }).sort({ createdAt: -1 }); // Most recent first

        if (existingLeads.length === 0) {
            return { isDuplicate: false, existingLead: null };
        }

        // Check the most recent lead
        const mostRecentLead = existingLeads[0];
        const now = new Date();
        const leadCreatedAt = new Date(mostRecentLead.createdAt);
        const hoursDifference = (now - leadCreatedAt) / (1000 * 60 * 60); // Convert to hours

        // If the most recent lead is within the threshold hours, it's a duplicate
        if (hoursDifference < hoursThreshold) {
            logger.debug(
                `Duplicate lead detected: ${customerPhone} at ${normalizedLocation} (${hoursDifference.toFixed(2)} hours ago)`
            );
            return { 
                isDuplicate: true, 
                existingLead: mostRecentLead,
                hoursAgo: hoursDifference.toFixed(2),
            };
        }

        // Lead exists but is older than threshold, allow it
        logger.debug(
            `Lead with same location+phone exists but is older than ${hoursThreshold}h (${hoursDifference.toFixed(2)} hours ago) - allowing`
        );
        return { isDuplicate: false, existingLead: mostRecentLead };
    } catch (error) {
        logger.error("Error checking duplicate lead:", error.message);
        // On error, allow the lead (fail open)
        return { isDuplicate: false, existingLead: null };
    }
};

module.exports = {
    checkDuplicateLead,
};

