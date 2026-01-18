const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
    {
        customer_name: {
            type: String,
            trim: true,
        },

        customer_phone: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
            lowercase: true, // Normalize to lowercase for case-insensitive matching
        },

        // WhatsApp tracking
        sent: {
            type: Boolean,
            default: false,
        },

        sent_to_count: {
            type: Number,
            default: 0, // how many manager numbers received this lead
        },

        sent_at: {
            type: Date,
        },

        // Track failed sends for retry
        failed_sends: {
            type: [String], // Array of manager WhatsApp numbers that failed
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Index for efficient querying by location and phone
 * Note: NOT unique - allows same phone for different locations
 * Duplicate prevention is handled by application logic (24h check per location)
 */
leadSchema.index(
    { location: 1, customer_phone: 1 }
);

/**
 * Index for querying unsent leads
 */
leadSchema.index({ sent: 1 });

/**
 * Index for duplicate checking (location, phone, createdAt)
 */
leadSchema.index(
    { location: 1, customer_phone: 1, createdAt: -1 }
);

// Note: Location normalization is handled by schema (lowercase: true, trim: true)
// No need for pre-save hook since Mongoose handles this automatically

module.exports = mongoose.model("Lead", leadSchema);
