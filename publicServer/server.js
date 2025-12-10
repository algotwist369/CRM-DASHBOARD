require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import Routes
const freeListingRoutes = require("./routes/freeListing.routes");
const bookDemoRoutes = require("./routes/bookDemo.routes");
const advertiseRoutes = require("./routes/advertise.routes");
const reviewManagementRoutes = require("./routes/reviewManagement.routes");

// Initialize Express App
const app = express();

// Middleware
// CORS configuration - allow multiple origins for development
const getAllowedOrigins = () => {
    const defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',  // Vite default port
        'http://localhost:5174',  // Vite alternate port
        'http://localhost:3001'
    ];
    
    if (process.env.CORS_ORIGIN) {
        if (process.env.CORS_ORIGIN === '*') {
            return '*';
        }
        // Split by comma and combine with default origins
        const envOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
        // Combine and remove duplicates
        return [...new Set([...defaultOrigins, ...envOrigins])];
    }
    
    return defaultOrigins;
};

app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const path = require("path");
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
app.use("/uploads", express.static(path.join(__dirname, UPLOAD_DIR)));

// Health Check Route
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/api/free-listing", freeListingRoutes);
app.use("/api/book-demo", bookDemoRoutes);
app.use("/api/advertise", advertiseRoutes);
app.use("/api/review-management", reviewManagementRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.path
    });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.DEBUG_MODE === "true" && { stack: err.stack })
    });
});

// MongoDB Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/crm_dashboard", {
            // Remove deprecated options for mongoose 9.x
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        process.exit(1);
    }
};

// Start Server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running on http://${HOST}:${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    });
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;

