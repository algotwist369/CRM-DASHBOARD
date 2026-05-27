const mongoose = require("mongoose");

const freeListingMongoUrl = process.env.MONGO_URL_FREE_LISTING;
let freeListingConnection = mongoose.connection;

if (freeListingMongoUrl) {
    freeListingConnection = mongoose.createConnection(freeListingMongoUrl, {
        maxPoolSize: 20,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000
    });

    freeListingConnection.on("connected", () => {
        if (process.env.FREE_LISTING_DB_LOGS === "true") {
            console.log("Free listing MongoDB connected");
        }
    });

    freeListingConnection.on("error", (error) => {
        console.error("Free listing MongoDB connection error:", error.message);
    });
}

const freeListingSchema = new mongoose.Schema(
    {
        user_name: { type: String, required: true, trim: true },
        user_phone: { type: String, required: true, trim: true, index: true },
        business_name: { type: String, required: true, trim: true },
        user_email: { type: String, trim: true, lowercase: true },
        business_category: {
            type: String,
            required: true,
            enum: ["spa & wellness", "salon", "other"],
            trim: true
        },
        number_of_outlets: { type: Number, required: true, min: 1 },
        message: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ["pending", "contacted", "approved", "rejected"],
            default: "pending",
            index: true
        },
        is_phone_verified: { type: Boolean, default: true },
        otp_verified_at: { type: Date },
        source: { type: String, default: "free-listing" },
        ip: { type: String },
        userAgent: { type: String }
    },
    { timestamps: true }
);

freeListingSchema.index({ createdAt: -1 });
freeListingSchema.index({ user_phone: 1, createdAt: -1 });

module.exports = freeListingConnection.model("FreeListing", freeListingSchema);
