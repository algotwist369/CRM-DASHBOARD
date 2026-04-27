// database.js - Optimized database configuration with connection pooling
const mongoose = require('mongoose');
require('dotenv').config();

// Database connection options for high performance
const dbOptions = {
    // Connection pool settings
    maxPoolSize: 100, // Increased for 10k+ users concurrency
    minPoolSize: 10,  // Maintain a minimum of 10 socket connections
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    serverSelectionTimeoutMS: 15000, // Increased to 15s to be more resilient
    socketTimeoutMS: 60000, // Increased to 60s for heavy aggregation queries
    
    // // Performance optimizations
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    
    // Write concern for better performance
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 10000
    },
    
    // Read preference for better performance
    readPreference: 'primaryPreferred',
    
    // Compression
    compressors: ['zlib'],
    
    // Connection timeout
    connectTimeoutMS: 20000, // Increased to 20s
    
    // Heartbeat frequency
    heartbeatFrequencyMS: 10000
};

// Connect to MongoDB with optimized settings
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb+srv://infoalgotwist_db_user:55zhwdorMn07uanx@cluster0.ejdcjld.mongodb.net/crm_dashboard';
        
        const conn = await mongoose.connect(mongoURI, dbOptions);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Connection event listeners for monitoring
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
        });
        
        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from MongoDB');
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('Mongoose connection closed through app termination');
            process.exit(0);
        });
        
        return conn;
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Get connection stats
const getConnectionStats = () => {
    const conn = mongoose.connection;
    return {
        readyState: conn.readyState,
        host: conn.host,
        port: conn.port,
        name: conn.name,
        collections: Object.keys(conn.collections).length
    };
};

// Health check for database
const checkDatabaseHealth = async () => {
    try {
        const stats = await mongoose.connection.db.stats();
        return {
            healthy: true,
            stats: {
                collections: stats.collections,
                dataSize: stats.dataSize,
                indexSize: stats.indexSize,
                storageSize: stats.storageSize
            }
        };
    } catch (error) {
        return {
            healthy: false,
            error: error.message
        };
    }
};

module.exports = {
    connectDB,
    getConnectionStats,
    checkDatabaseHealth
};
