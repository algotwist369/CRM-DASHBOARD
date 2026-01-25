const mongoose = require("mongoose");

// MICROSERVICE ARCHITECTURE: Separate Database Connection for Google Sheets Data
// This decouples the leads data from the main CRM database.
// If the URI is not provided, it falls back to the default connection (for dev/testing).
const itemsURI = process.env.MONGO_URI_FOR_GOOGLE_SHEET || "mongodb+srv://infoalgotwist_db_user:oqgmuAaUJMvyISsR@cluster0.mrvbcuo.mongodb.net/whatsapp-leads";

let dbConnection;
if (itemsURI) {
    console.log("GoogleSheet Service: Connecting to dedicated separate database...");
    dbConnection = mongoose.createConnection(itemsURI);

    dbConnection.on('connected', () => {
        console.log("GoogleSheet Service: Connected to microservice database.");
    });

    dbConnection.on('error', (err) => {
        console.error("GoogleSheet Service DB Error:", err.message);
    });
} else {
    console.warn("GoogleSheet Service: MONGO_URI_FOR_GOOGLE_SHEET not found, using default database.");
    dbConnection = mongoose; // Fallback to default
}

const googleSheetLeadSchema = new mongoose.Schema(
    {
        location: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        customerPhone: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        customerName: {
            type: String,
            trim: true
        },
        syncedAt: {
            type: Date,
            default: Date.now
        },
        isCalled: {
            type: Boolean,
            default: false
        },
        isWhatsapp: {
            type: Boolean,
            default: false
        },
        isCalledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Manager"
        },
        isWhatsappBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Manager"
        },
        lastModified: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Compound index for uniqueness (Location + Phone) to prevent duplicates
googleSheetLeadSchema.index({ location: 1, customerPhone: 1 }, { unique: true });

// Index for efficient querying
googleSheetLeadSchema.index({ syncedAt: -1 });
googleSheetLeadSchema.index({ createdAt: -1 });

// Pre-save middleware to update lastModified
googleSheetLeadSchema.pre('save', function (next) {
    this.lastModified = new Date();
    next();
});


module.exports = dbConnection.model("GoogleSheetLead", googleSheetLeadSchema);
