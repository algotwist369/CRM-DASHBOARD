const logger = require("../utils/logger");
 
const sendLeadOnWhatsApp = async (to, lead, useRetry = true) => {
    const templateParams = {
        location: lead.location || "N/A",
        customerName: lead.customer_name || "N/A",
        customerPhone: lead.customer_phone,
    };

    // DIRECT DOUBLETICK
    try {
        const { sendDoubleTickMessage } = require("../config/doubletick");
        return await sendDoubleTickMessage(to, templateParams);
    } catch (error) {
        logger.error(`DoubleTick execution failed for ${to}`, error);
        throw error;
    }
};

module.exports = {
    sendLeadOnWhatsApp,
};
