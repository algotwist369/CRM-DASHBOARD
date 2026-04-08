const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI must be set in environment variables");
        }

        await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: true,
            maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 10,
            serverSelectionTimeoutMS: 5000,
        });

        logger.info("MongoDB connected successfully");

        // Handle connection events
        mongoose.connection.on("error", (err) => {
            logger.error("MongoDB connection error:", err.message);
        });

        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB disconnected");
        });
    } catch (error) {
        logger.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
    } catch (error) {
        logger.error("Error closing MongoDB connection:", error.message);
    }
};

module.exports = { connectDB, disconnectDB };
