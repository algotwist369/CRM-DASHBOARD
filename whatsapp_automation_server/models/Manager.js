const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema(
    {
        location: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        whatsapp_number: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Prevent duplicate manager assignments just for the SAME location
 * Valid:
 * - +919876543210 (Vashi)
 * - +919876543210 (Belapur)
 *
 * Invalid:
 * - +919876543210 (Vashi) -- if already exists
 */
managerSchema.index(
    { location: 1, whatsapp_number: 1 },
    { unique: true }
);

/**
 * Optimize lookup by location
 */
managerSchema.index(
    { location: 1 }
);

// Note: Location and phone normalization is handled in validation middleware
// No need for pre-save hook since values are already sanitized

module.exports = mongoose.model("Manager", managerSchema);
