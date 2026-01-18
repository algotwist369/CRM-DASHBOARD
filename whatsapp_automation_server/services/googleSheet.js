const axios = require("axios");
const csv = require("csvtojson");
const logger = require("../utils/logger");
// Note: dotenv is loaded in server.js, no need to load here

const SHEET_TIMEOUT = parseInt(process.env.SHEET_TIMEOUT_MS) || 15000;

/**
 * Fetch leads from PUBLIC Google Sheet (CSV)
 * Required columns:
 * Customer Name | Location | Customer Phone
 */
const fetchGoogleSheetLeads = async () => {
    const SHEET_URL = process.env.GOOGLE_SHEET_CSV_URL;

    if (!SHEET_URL) {
        throw new Error("GOOGLE_SHEET_CSV_URL not defined in env");
    }

    try {
        const response = await axios.get(SHEET_URL, {
            timeout: SHEET_TIMEOUT,
            validateStatus: (status) => status === 200,
        });

        const rows = await csv().fromString(response.data);

        return rows.map((row) => ({
            customer_name: row["Customer Name"]?.trim() || "",
            location: row["Location"]?.trim()?.toLowerCase() || "", // Normalize to lowercase
            customer_phone: row["Customer Phone"]?.trim() || "",
        })).filter((row) => row.location && row.customer_phone); // Filter out invalid rows
    } catch (error) {
        // Handle specific HTTP errors with helpful messages
        if (error.response) {
            const status = error.response.status;
            const statusText = error.response.statusText;
            
            if (status === 401 || status === 403) {
                const errorMsg = `Google Sheet access denied (${status} ${statusText}). The sheet must be publicly accessible.`;
                logger.error(errorMsg);
                logger.error("");
                logger.error("To fix this:");
                logger.error("1. Open your Google Sheet");
                logger.error("2. Click 'Share' button (top right)");
                logger.error("3. Click 'Change to anyone with the link'");
                logger.error("4. Select 'Viewer' permission");
                logger.error("5. Copy link and click 'Done'");
                logger.error("");
                logger.error("Then publish the sheet for CSV export:");
                logger.error("1. Go to File → Share → Publish to web");
                logger.error("2. Select the sheet/tab you want");
                logger.error("3. Choose 'Comma-separated values (.csv)' format");
                logger.error("4. Click 'Publish' and copy the CSV URL");
                logger.error("5. Update GOOGLE_SHEET_CSV_URL in your .env file");
                throw new Error(errorMsg + " See logs above for instructions.");
            } else if (status === 404) {
                const errorMsg = `Google Sheet not found (404). Please check your GOOGLE_SHEET_CSV_URL in .env file.`;
                logger.error(errorMsg);
                logger.error(`Current URL: ${SHEET_URL}`);
                throw new Error(errorMsg);
            } else {
                logger.error(`Failed to fetch Google Sheet: ${status} ${statusText}`);
                throw new Error(`Failed to fetch Google Sheet: ${status} ${statusText}`);
            }
        }
        
        // Handle network/timeout errors
        if (error.code === "ECONNABORTED") {
            logger.error("Google Sheet request timed out");
            throw new Error(`Google Sheet request timed out after ${SHEET_TIMEOUT}ms`);
        }
        
        logger.error("Failed to fetch Google Sheet:", error.message);
        throw new Error(`Failed to fetch Google Sheet: ${error.message}`);
    }
};

module.exports = {
    fetchGoogleSheetLeads,
};
