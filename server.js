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
const { redis } = require('./config/redis');

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 5000;

if (cluster.isPrimary) {
    console.log(`🚀 Master process ${process.pid} is running`);

    // ================================================================
    // MASTER PROCESS - BACKGROUND SERVICES ONLY
    // ================================================================

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
        stopGoogleSheetSync();
        await whatsappWebService.destroy();
        process.exit(0);
    };

    process.on('SIGTERM', shutdownMaster);
    process.on('SIGINT', shutdownMaster);

} else {
    // ================================================================
    // WORKER PROCESS - HTTP & SOCKET SERVER
    // ================================================================

    // Connect to MongoDB (each worker needs its own connection)
    connectDB();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO (each worker handles its own sockets, synced via Redis Adapter)
    initializeSocket(server);

    server.listen(PORT, () => {
        console.log(`🟢 Worker ${process.pid} started on port ${PORT}`);
    });

    // Graceful shutdown for Worker
    const shutdownWorker = () => {
        console.log(`Worker ${process.pid} shutting down...`);
        server.close(() => {
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdownWorker);
    process.on('SIGINT', shutdownWorker);
}