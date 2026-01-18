const twilio = require("twilio");
const logger = require("../utils/logger");

// Validate Twilio credentials at module load
const accountSid = process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.trim() : "";
const authToken = process.env.TWILIO_AUTH_TOKEN ? process.env.TWILIO_AUTH_TOKEN.trim() : "";

if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in environment variables");
}

if (!process.env.TWILIO_WHATSAPP_NUMBER) {
    throw new Error("TWILIO_WHATSAPP_NUMBER must be set in environment variables");
}

const client = twilio(accountSid, authToken);

// WhatsApp number format: whatsapp:+919152880134 (your personal number)
// If number doesn't start with 'whatsapp:', add it automatically
const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_NUMBER?.startsWith("whatsapp:")
    ? process.env.TWILIO_WHATSAPP_NUMBER
    : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

// Content Template SID from Twilio
// MUST be set in .env
if (!process.env.TWILIO_CONTENT_TEMPLATE_SID) {
    logger.warn("TWILIO_CONTENT_TEMPLATE_SID is not set in .env. WhatsApp messages will likely fail.");
}

const sendWhatsApp = async (to, templateParams) => {
    try {
        // Smartly handle 'whatsapp:' prefix from .env
        const envNumber = process.env.TWILIO_WHATSAPP_NUMBER;
        const from = envNumber.startsWith("whatsapp:") ? envNumber : `whatsapp:${envNumber}`;

        // Ensure 'to' has whatsapp: prefix if not present
        const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        logger.info(`Sending WhatsApp to ${toNumber} with params:`, templateParams);

        const messageOptions = {
            from: from,
            to: toNumber,
        };

        // Check for Content Template SID
        const contentSid = process.env.TWILIO_CONTENT_TEMPLATE_SID;

        // FORCE FALLBACK: Twilio is blocking the template (Error 63049).
        // Temporarily bypassing Template mode to ensure delivery via Plain Text.
        const FORCE_PLAIN_TEXT = true;

        if (contentSid && !FORCE_PLAIN_TEXT) {
            // Option A: Use Content Template Builder (Preferred)
            messageOptions.contentSid = contentSid;
            messageOptions.contentVariables = JSON.stringify({
                "1": templateParams.location || "N/A",
                "2": templateParams.customerName || "Customer",
                "3": templateParams.customerPhone || "N/A"
            });
        } else {
            if (FORCE_PLAIN_TEXT) logger.warn("FORCING PLAIN TEXT MODE (Template bypassed)");
            // Option B: Fallback to Legacy/Body text
            logger.warn("⚠️ Sending as plain text body");
            messageOptions.body = `New inquiry for ${templateParams.location || "N/A"}. Name ${templateParams.customerName || "Customer"}, Phone ${templateParams.customerPhone || "N/A"}. Regards, SpaAdvisor Team`;
        }

        const message = await client.messages.create(messageOptions);

        logger.info(`Twilio Accepted: SID=${message.sid}, Status=${message.status}`);
        if (message.errorCode) {
            logger.error(`Twilio Logic Error: ${message.errorCode} - ${message.errorMessage}`);
        }

        return message;
    } catch (error) {
        logger.error("Twilio API Fatal Error:", error);
        // Log more details if available
        if (error.code) logger.error(`   Code: ${error.code}`);
        if (error.moreInfo) logger.error(`   More Info: ${error.moreInfo}`);
        throw error;
    }
};

/**
 * Send WhatsApp with retry mechanism
 */
const sendWhatsAppWithRetry = async (to, templateParams, maxRetries = 3) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await sendWhatsApp(to, templateParams);
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, attempt - 1) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};

module.exports = {
    sendWhatsApp,
    sendWhatsAppWithRetry,
};
