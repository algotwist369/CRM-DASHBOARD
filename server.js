require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/database");
const { initializeSocket } = require("./config/socket");
const { startCampaignScheduler } = require("./utils/campaignScheduler");
const whatsappWebService = require("./services/whatsappWebService");

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Initialize WhatsApp Web service (non-blocking)
whatsappWebService.initialize().catch(err => {
    console.error('[Server] WhatsApp initialization failed:', err.message);
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 Socket.IO ready for real-time connections`);

    // Start campaign scheduler for automated and drip campaigns
    startCampaignScheduler();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');

    await whatsappWebService.destroy();

    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');

    await whatsappWebService.destroy();

    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});