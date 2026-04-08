const Bull = require("bull");
const { processLead } = require("../queue/leadProcessor");
const logger = require("../utils/logger");
require("dotenv").config();

// Create DEDICATED worker queue instance to avoid singleton issues
const leadWorkerQueue = new Bull("lead-processing", {
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
    },
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
    }
});

/**
 * Worker to process lead queue jobs
 * Uses default (unnamed) jobs
 * Concurrency: 5 jobs at a time
 */
leadWorkerQueue.process(5, async (job) => {
    logger.info(`[WORKER] Picked up job ${job.id} - Processing...`);

    // Explicitly update progress immediately
    await job.progress(1);

    try {
        const result = await processLead(job);
        await job.progress(100);
        return result;
    } catch (error) {
        logger.error(`Job ${job.id} processing error:`, error.message);
        throw error;
    }
});

// Queue event listeners
leadWorkerQueue.on("ready", () => {
    logger.info("✅ DEDICATED Worker Queue Ready");
});

leadWorkerQueue.on("active", (job) => {
    logger.info(`[WORKER] Job ${job.id} became ACTIVE`);
});

leadWorkerQueue.on("error", (error) => {
    logger.error("Worker Queue Error:", error.message);
});

logger.info("Lead processing worker module loaded");

module.exports = leadWorkerQueue;
