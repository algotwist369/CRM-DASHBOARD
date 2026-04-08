require("dotenv").config();
const mongoose = require("mongoose");
const Lead = require("./models/Lead");
const leadQueue = require("./queue/leadQueue");

async function resetSystem() {
    console.log("🔥 Starting Full System Reset...");

    // 1. Connect to MongoDB
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        // Wipe Leads
        const deleteResult = await Lead.deleteMany({});
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} leads from MongoDB.`);

        // NOTE: We do NOT delete Managers, as they are required for sending messages.
        console.log("ℹ️  Managers collection preserved.");

    } catch (err) {
        console.error("❌ MongoDB Error:", err.message);
    }

    // 2. Clear Redis Queue
    console.log("⏳ Clearing Redis Queue...");
    try {
        // Force obliterate to remove everything (active, wait, delayed, etc)
        // Note: Using generic clean if obliterate fails, but obliterate is best here.
        await leadQueue.obliterate({ force: true });
        console.log("✅ Redis Queue 'lead-processing' completely obliterated.");
    } catch (err) {
        console.error("⚠️  Redis Obliterate failed (might be empty/connection issue):", err.message);
        try {
            await leadQueue.empty();
            console.log("✅ Redis Queue emptied (fallback).");
        } catch (e) {
            console.error("❌ Redis Clean Error:", e.message);
        }
    }

    console.log("✨ System Reset Complete. You can now restart the server.");
    process.exit(0);
}

resetSystem();
