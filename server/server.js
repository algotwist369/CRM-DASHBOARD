require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/database");
const { initializeSocket } = require("./config/socket");

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 Socket.IO ready for real-time connections`);
});