// redis.js - Advanced Redis configuration for high-performance caching
const Redis = require('ioredis');

// Redis connection configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,

    // Connection pool settings
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxLoadingTimeout: 5000,

    // Performance optimizations
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,

    // Cluster support (if using Redis Cluster)
    enableOfflineQueue: true,

    // Memory optimization
    maxMemoryPolicy: 'allkeys-lru',

    // Connection events
    onConnect: () => {
        console.log('Redis connected successfully');
    },
    onError: (err) => {
        // Suppress connection errors in global handler too
        if (!err.message.includes('Stream isn\'t writeable') &&
            !err.message.includes('ECONNREFUSED')) {
            console.error('Redis connection error:', err);
        }
    },
    onClose: () => {
        console.log('Redis connection closed');
    }
};

// Create Redis client
const redis = new Redis(redisConfig);

// Advanced caching utilities
class CacheManager {
    constructor() {
        this.redis = redis;
        this.defaultTTL = 300; // 5 minutes default
    }

    // Helper to check if error should be logged
    shouldLogError(error) {
        return !error.message.includes('Stream isn\'t writeable') &&
            !error.message.includes('ECONNREFUSED') &&
            !error.message.includes('enableOfflineQueue');
    }

    // Set cache with TTL
    async set(key, value, ttl = this.defaultTTL) {
        if (this.redis.status !== 'ready') return false;
        try {
            const serializedValue = JSON.stringify(value);
            await this.redis.setex(key, ttl, serializedValue);
            return true;
        } catch (error) {
            if (this.shouldLogError(error)) {
                console.error('Cache set error:', error);
            }
            return false;
        }
    }

    // Get cache
    async get(key) {
        if (this.redis.status !== 'ready') return null;
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            if (this.shouldLogError(error)) {
                console.error('Cache get error:', error);
            }
            return null;
        }
    }

    // Delete cache
    async del(key) {
        if (this.redis.status !== 'ready') return false;
        try {
            await this.redis.del(key);
            return true;
        } catch (error) {
            if (this.shouldLogError(error)) {
                console.error('Cache delete error:', error);
            }
            return false;
        }
    }

    // Delete multiple keys
    async delPattern(pattern) {
        if (this.redis.status !== 'ready') return 0;
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
            return keys.length;
        } catch (error) {
            if (this.shouldLogError(error)) {
                console.error('Cache delete pattern error:', error);
            }
            return 0;
        }
    }

    // Check if key exists
    async exists(key) {
        if (this.redis.status !== 'ready') return false;
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        } catch (error) {
            if (this.shouldLogError(error)) {
                console.error('Cache exists error:', error);
            }
            return false;
        }
    }

    // Set with expiration
    async setex(key, value, ttl) {
        return this.set(key, value, ttl);
    }

    // Increment counter
    async incr(key, ttl = this.defaultTTL) {
        if (this.redis.status !== 'ready') return 0;
        try {
            const result = await this.redis.incr(key);
            if (result === 1) {
                await this.redis.expire(key, ttl);
            }
            return result;
        } catch (error) {
            if (this.shouldLogError(error)) {
                console.error('Cache increment error:', error);
            }
            return 0;
        }
    }

    // Get or set pattern (cache-aside)
    async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
        // If Redis is not ready, skip directly to fetchFunction
        if (this.redis.status !== 'ready') return await fetchFunction();

        try {
            // Try to get from cache first
            let value = await this.get(key);

            if (value === null) {
                // Cache miss - fetch from source
                value = await fetchFunction();

                // Store in cache
                if (value !== null && value !== undefined) {
                    await this.set(key, value, ttl);
                }
            }

            return value;
        } catch (error) {
            if (this.shouldLogError(error)) {
                console.error('Cache getOrSet error:', error);
            }
            // Fallback to direct fetch
            return await fetchFunction();
        }
    }

    // Batch operations
    async mget(keys) {
        if (this.redis.status !== 'ready') return keys.map(() => null);
        try {
            const values = await this.redis.mget(...keys);
            return values.map(value => value ? JSON.parse(value) : null);
        } catch (error) {
            if (this.shouldLogError(error)) {
                console.error('Cache mget error:', error);
            }
            return keys.map(() => null);
        }
    }

    async mset(keyValuePairs, ttl = this.defaultTTL) {
        if (this.redis.status !== 'ready') return false;
        try {
            const pipeline = this.redis.pipeline();

            for (const [key, value] of keyValuePairs) {
                const serializedValue = JSON.stringify(value);
                pipeline.setex(key, ttl, serializedValue);
            }

            await pipeline.exec();
            return true;
        } catch (error) {
            if (this.shouldLogError(error)) {
                console.error('Cache mset error:', error);
            }
            return false;
        }
    }

    // Health check
    async healthCheck() {
        try {
            const pong = await this.redis.ping();
            return pong === 'PONG';
        } catch (error) {
            return false;
        }
    }

    // Get cache statistics
    async getStats() {
        try {
            const info = await this.redis.info('memory');
            const keyspace = await this.redis.info('keyspace');

            return {
                connected: true,
                memory: info,
                keyspace: keyspace
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }
}

// Create cache manager instance
const cacheManager = new CacheManager();

// Cache key generators
const cacheKeys = {
    // Admin cache keys
    adminDashboard: (adminId) => `admin:${adminId}:dashboard`,
    adminBusinesses: (adminId, filters) => `admin:${adminId}:businesses:${JSON.stringify(filters)}`,

    // Business cache keys
    business: (businessId) => `business:${businessId}`,
    businessStaff: (businessId) => `business:${businessId}:staff`,
    businessCustomers: (businessId) => `business:${businessId}:customers`,

    // Manager cache keys
    managerDashboard: (managerId) => `manager:${managerId}:dashboard`,
    managerStaff: (managerId) => `manager:${managerId}:staff`,
    managerTransactions: (managerId) => `manager:${managerId}:transactions`,

    // Customer cache keys
    customer: (customerId) => `customer:${customerId}`,
    customerAnalytics: (businessId) => `customer:analytics:${businessId}`,

    // Appointment cache keys
    appointmentSlots: (businessId, date) => `appointments:${businessId}:slots:${date}`,
    appointments: (businessId) => `appointments:${businessId}`,

    // Notification cache keys
    notifications: (businessId) => `notifications:${businessId}`,

    // Rate limiting keys
    rateLimit: (ip, endpoint) => `ratelimit:${ip}:${endpoint}`,

    // Session keys
    session: (token) => `session:${token}`
};

module.exports = {
    redis,
    cacheManager,
    cacheKeys
};
