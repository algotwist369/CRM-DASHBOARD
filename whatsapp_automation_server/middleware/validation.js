const { validateAndSanitizePhone, isValidPhone } = require("../utils/phoneValidator");
const logger = require("../utils/logger");

/**
 * Validate manager creation request
 */
const validateManager = (req, res, next) => {
    // Debugging: Log what we received
    console.log("[API] Received Manager Create Request:");
    console.log("   Headers:", JSON.stringify(req.headers['content-type']));
    console.log("   Body:", JSON.stringify(req.body));

    // Check Content-Type
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
        return res.status(400).json({
            success: false,
            message: "Missing or invalid 'Content-Type' header. Please set it to 'application/json'.",
        });
    }

    // Handle case where body is undefined (e.g. invalid JSON)
    const { location, whatsapp_number } = req.body || {};

    if (!location || typeof location !== "string" || !location.trim()) {
        return res.status(400).json({
            success: false,
            message: "location is required and must be a non-empty string",
        });
    }

    if (!whatsapp_number || typeof whatsapp_number !== "string") {
        return res.status(400).json({
            success: false,
            message: "whatsapp_number is required and must be a string",
        });
    }

    const sanitizedPhone = validateAndSanitizePhone(whatsapp_number);
    if (!sanitizedPhone) {
        return res.status(400).json({
            success: false,
            message: "Invalid whatsapp_number format. You can send: 10-digit number (e.g., 9876543210) or +919876543210 or 919876543210. +91 will be added automatically for 10-digit numbers.",
        });
    }

    // Attach sanitized values to request
    req.body.location = location.trim().toLowerCase();
    req.body.whatsapp_number = sanitizedPhone;

    next();
};

module.exports = {
    validateManager,
};

