require("dotenv").config({ quiet: true });
const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/database");
const { initializeSocket } = require("./config/socket");
const { startCampaignScheduler } = require("./utils/campaignScheduler");
const whatsappWebService = require("./services/whatsappWebService");
const { startGoogleSheetSync, stopGoogleSheetSync } = require("./services/googleSheetSyncService");
const cluster = require('cluster');
const os = require('os');
const { redis, shutdown: redisShutdown } = require('./config/redis');
const { shutdown: socketShutdown } = require('./config/socket');

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 5000;

if (cluster.isPrimary) {
    console.log(`🚀 Master process ${process.pid} is running`);

    // ================================================================
    // MASTER PROCESS - BACKGROUND SERVICES ONLY
    // ================================================================

    // Connect to MongoDB first (required for background services)
    connectDB().then(() => {
        console.log('✅ Master process connected to MongoDB');

        // 1. WhatsApp Web Service (Singleton)
        whatsappWebService.initialize()
            .then(() => whatsappWebService.startCommandListener())
            .catch(err => {
                console.error('[Server] WhatsApp initialization failed:', err.message);
            });

        // 2. Campaign Scheduler (Singleton)
        startCampaignScheduler();

        // 3. Google Sheets Sync (Singleton)
        startGoogleSheetSync();
    }).catch(err => {
        console.error('❌ Master process failed to connect to MongoDB:', err.message);
        process.exit(1);
    });

    // Fork workers
    console.log(`Forking ${numCPUs} workers...`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
        console.log(`❌ Worker ${worker.process.pid} died. Respawning...`);
        cluster.fork();
    });

    // Graceful shutdown for Master
    const shutdownMaster = async () => {
        console.log('Shutting down Master gracefully...');

        // Stop background services
        stopGoogleSheetSync();
        await whatsappWebService.destroy();

        // Close all Redis connections
        await redisShutdown();

        console.log('✅ Master shutdown complete');
        process.exit(0);
    };

    process.on('SIGTERM', shutdownMaster);
    process.on('SIGINT', shutdownMaster);

} else {
    // ================================================================
    // WORKER PROCESS - HTTP & SOCKET SERVER
    // ================================================================

    // Async wrapper to ensure DB connects before starting server
    (async () => {
        try {
            // Connect to MongoDB (each worker needs its own connection)
            await connectDB();
            console.log(`✅ Worker ${process.pid} connected to MongoDB`);

            // Create HTTP server
            const server = http.createServer(app);

            // Initialize Socket.IO (each worker handles its own sockets, synced via Redis Adapter)
            initializeSocket(server);

            server.listen(PORT, () => {
                console.log(`🟢 Worker ${process.pid} started on port ${PORT}`);
            });

            // Graceful shutdown for Worker
            const shutdownWorker = async () => {
                console.log(`Worker ${process.pid} shutting down...`);

                // Close Socket.IO and its Redis connections
                await socketShutdown();

                // Close HTTP server
                server.close(async () => {
                    // Close any remaining Redis connections
                    await redisShutdown();
                    console.log(`✅ Worker ${process.pid} shutdown complete`);
                    process.exit(0);
                });
            };

            process.on('SIGTERM', shutdownWorker);
            process.on('SIGINT', shutdownWorker);
        } catch (err) {
            console.error(`❌ Worker ${process.pid} failed to start:`, err.message);
            process.exit(1);
        }
    })();
}