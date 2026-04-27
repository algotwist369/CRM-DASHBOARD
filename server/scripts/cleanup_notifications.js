require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const ManagerNotification = require('../models/ManagerNotification');

const cleanup = async () => {
    try {
        console.log("Connecting...");
        await connectDB();
        console.log("Connected to DB");

        const res = await ManagerNotification.deleteMany({
            $or: [
                { "metadata.source": "test_endpoint" },
                { title: "Test Notification" }
            ]
        });

        console.log(`Deleted ${res.deletedCount} test notifications.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanup();
