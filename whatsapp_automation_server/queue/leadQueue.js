const Bull = require("bull");
const { isRedisAvailable, REDIS_ENABLED } = require("../config/redis");
const logger = require("../utils/logger");

if (!REDIS_ENABLED) {
    logger.warn("Queue system disabled - Redis is not enabled");
}

// Create lead processing queue
const leadQueue = new Bull("lead-processing", {
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB) || 0,
        maxRetriesPerRequest: null, // Retry indefinitely
        enableReadyCheck: false,
        lazyConnect: true,
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: {
            age: 3600, // Keep completed jobs for 1 hour
            count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
            age: 24 * 3600, // Keep failed jobs for 24 hours
        },
    },
    settings: {
        stalledInterval: 30 * 1000, // Check for stalled jobs every 30 seconds
        maxStalledCount: 1,
    },
});

// Queue event listeners
leadQueue.on("error", (error) => {
    // Only log non-connection errors to reduce spam
    if (error.code !== "ECONNREFUSED") {
        logger.error("Lead queue error:", error.message || error);
    }
});

leadQueue.on("waiting", (jobId) => {
    logger.debug(`Job ${jobId} is waiting`);
});

leadQueue.on("active", (job) => {
    logger.info(`Processing job ${job.id} - Lead: ${job.data.customer_name || "Unknown"}`);
});

leadQueue.on("completed", (job, result) => {
    logger.info(`Job ${job.id} completed - ${result.sent_to_count} WhatsApp messages sent`);
});

leadQueue.on("failed", (job, err) => {
    logger.error(`Job ${job.id} failed:`, err.message);
});

leadQueue.on("stalled", (job) => {
    logger.warn(`Job ${job.id} stalled`);
});

module.exports = leadQueue;

