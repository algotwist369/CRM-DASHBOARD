const express = require("express");
require("dotenv").config();

const { validateEnv } = require("./utils/envValidator");
const { connectDB, disconnectDB } = require("./config/db");
const leadRoutes = require("./routes/lead.routes");
const managerRoutes = require("./routes/manager.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const logger = require("./utils/logger");

// Validate environment variables before starting
try {
    validateEnv();
} catch (error) {
    logger.error("Environment validation failed:", error.message);
    process.exit(1);
}

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
    const mongoose = require("mongoose");
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    
    // Check Redis connection
    let redisStatus = "disconnected";
    try {
        const redis = require("./config/redis");
        redisStatus = redis.status === "ready" ? "connected" : "disconnected";
    } catch (error) {
        redisStatus = "error";
    }
    
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        redis: redisStatus,
    });
});

// API Routes
app.use("/api/leads", leadRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/analytics", analyticsRoutes);

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "WhatsApp Automation Server API",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            leads: "/api/leads",
            managers: "/api/managers",
            analytics: "/api/analytics",
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    logger.error("Unhandled error:", err.message, err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

// Start queue-based cron job (fetches leads and adds to queue)
require("./cron/syncAndQueue");

// Start queue worker (processes leads from queue)
require("./workers/leadWorker");

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received, starting graceful shutdown...`);

    server.close(async () => {
        logger.info("HTTP server closed");

        try {
            // Close queue connections
            try {
                const leadQueue = require("./queue/leadQueue");
                await leadQueue.close();
                logger.info("Queue connections closed");
            } catch (error) {
                logger.warn("Error closing queue:", error.message);
            }

            // Close Redis connection
            try {
                const redis = require("./config/redis");
                await redis.quit();
                logger.info("Redis connection closed");
            } catch (error) {
                logger.warn("Error closing Redis:", error.message);
            }

            // Close database connection
            await disconnectDB();
            logger.info("Graceful shutdown completed");
            process.exit(0);
        } catch (error) {
            logger.error("Error during shutdown:", error.message);
            process.exit(1);
        }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Promise Rejection:", err);
    gracefulShutdown("unhandledRejection");
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    gracefulShutdown("uncaughtException");
});

module.exports = app;
