const Redis = require("ioredis");
const logger = require("../utils/logger");

// Redis connection configuration
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_DB = parseInt(process.env.REDIS_DB) || 0;
const REDIS_ENABLED = process.env.REDIS_ENABLED !== "false"; // Default to true

let redis = null;
let redisConnected = false;

if (REDIS_ENABLED) {
    // Create Redis connection with lazy connect
    redis = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        db: REDIS_DB,
        lazyConnect: true, // Don't connect immediately
        retryStrategy: (times) => {
            // Exponential backoff with max delay of 5 seconds
            const delay = Math.min(times * 100, 5000);
            if (times > 10) {
                // After 10 retries, stop trying and log warning
                logger.warn("Redis connection failed after multiple attempts. Queue system will not work until Redis is available.");
                return null; // Stop retrying
            }
            return delay;
        },
        maxRetriesPerRequest: null, // Retry indefinitely for queue operations
        enableReadyCheck: false, // Don't wait for ready check
    });

    redis.on("connect", () => {
        redisConnected = true;
        logger.info(`✅ Redis connected to ${REDIS_HOST}:${REDIS_PORT}`);
    });

    redis.on("ready", () => {
        redisConnected = true;
        logger.info("✅ Redis is ready");
    });

    redis.on("error", (error) => {
        redisConnected = false;
        // Only log error if it's not a connection refused (to reduce spam)
        if (error.code !== "ECONNREFUSED" || !error.message.includes("ECONNREFUSED")) {
            logger.error("Redis connection error:", error.message);
        }
    });

    redis.on("close", () => {
        redisConnected = false;
        logger.warn("Redis connection closed");
    });

    // Attempt to connect
    redis.connect().catch((error) => {
        if (error.code === "ECONNREFUSED") {
            logger.warn(`⚠️  Redis not available at ${REDIS_HOST}:${REDIS_PORT}`);
            logger.warn("   Queue system requires Redis. Please start Redis server or set REDIS_ENABLED=false");
            logger.warn("   To install Redis: https://redis.io/docs/getting-started/");
        }
    });
} else {
    logger.warn("Redis is disabled (REDIS_ENABLED=false). Queue system will not work.");
}

// Helper function to check if Redis is available
const isRedisAvailable = () => {
    return REDIS_ENABLED && redis !== null && redisConnected;
};

module.exports = redis;
module.exports.isRedisAvailable = isRedisAvailable;
module.exports.REDIS_ENABLED = REDIS_ENABLED;

