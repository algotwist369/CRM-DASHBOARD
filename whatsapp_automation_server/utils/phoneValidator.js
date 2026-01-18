/**
 * Validate and sanitize phone numbers
 * Automatically adds +91 for Indian numbers if not present
 * Accepts formats: +919876543210, 919876543210, 9876543210
 * Returns: +919876543210 format (always with +91 for Indian numbers)
 */
const validateAndSanitizePhone = (phone) => {
    if (!phone || typeof phone !== "string") {
        return null;
    }

    // Remove all non-digit characters except +
    let cleaned = phone.trim().replace(/[^\d+]/g, "");

    if (!cleaned || cleaned.length < 10) {
        return null;
    }

    // If starts with +91, keep as is
    if (cleaned.startsWith("+91")) {
        if (cleaned.length === 13) { // +91 + 10 digits
            return cleaned;
        }
        return null;
    }

    // If starts with + but not +91, check if it's valid international format
    if (cleaned.startsWith("+")) {
        // If it's already a valid international format (not Indian), keep it
        if (cleaned.length >= 10 && cleaned.length <= 15) {
            return cleaned;
        }
        return null;
    }

    // If starts with 91 (without +), add +
    if (cleaned.startsWith("91") && cleaned.length === 12) {
        return `+${cleaned}`;
    }

    // If 10 digits, assume Indian number and add +91 automatically
    if (cleaned.length === 10) {
        return `+91${cleaned}`;
    }

    // RELAXED VALIDATION:
    // If 11-15 digits, assume it's a valid international number (e.g. 66xxxxxxxxx)
    // and just add '+' if missing.
    if (cleaned.length >= 11 && cleaned.length <= 15) {
        if (!cleaned.startsWith("+")) {
            return `+${cleaned}`;
        }
        return cleaned;
    }

    // Invalid format
    return null;
};

/**
 * Validate phone number format
 */
const isValidPhone = (phone) => {
    const sanitized = validateAndSanitizePhone(phone);
    return sanitized !== null;
};

module.exports = {
    validateAndSanitizePhone,
    isValidPhone,
};

