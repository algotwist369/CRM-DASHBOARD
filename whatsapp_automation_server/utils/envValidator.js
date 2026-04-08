const logger = require("./logger");

/**
 * Validate all required environment variables
 */
const validateEnv = () => {
    const required = [
        "MONGO_URI",
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN",
        "TWILIO_WHATSAPP_NUMBER",
        "GOOGLE_SHEET_CSV_URL",
    ];

    const missing = [];

    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        logger.error("Missing required environment variables:", missing.join(", "));
        logger.error("");
        logger.error("Please add the following variables to your .env file:");
        missing.forEach(key => {
            logger.error(`  ${key}=your_value_here`);
        });
        logger.error("");
        logger.error("Example for GOOGLE_SHEET_CSV_URL:");
        logger.error("  GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0");
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}. Please check your .env file.`
        );
    }

    // Redis is optional but recommended for queue system
    if (!process.env.REDIS_HOST) {
        logger.warn("Redis not configured. Queue system will use default localhost:6379");
        logger.warn("For production, set REDIS_HOST, REDIS_PORT in .env");
    }

    logger.info("All required environment variables are set");
    return true;
};

module.exports = { validateEnv };

