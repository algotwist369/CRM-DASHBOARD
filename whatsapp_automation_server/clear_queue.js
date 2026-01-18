require("dotenv").config();
const leadQueue = require("./queue/leadQueue");

async function clearQueue() {
    console.log("⏳ Connecting to Redis queue...");
    console.log(`Host: ${process.env.REDIS_HOST}, Port: ${process.env.REDIS_PORT}`);

    // Wait for ready
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Connection timed out after 10s"));
        }, 10000);

        leadQueue.client.on('ready', () => {
            clearTimeout(timeout);
            console.log("✅ Redis Connection Ready");
            resolve();
        });

        leadQueue.client.on('error', (err) => {
            console.error("Redis Client Error:", err);
        });
    });

    console.log("💥 Starting manual clean...");

    try {
        await leadQueue.pause(); // Pause processing

        await leadQueue.empty(); // Clears wait, active, delayed
        console.log("✅ Main queue emptied");

        // Clean specific states
        const types = ['completed', 'failed', 'delayed', 'active', 'wait', 'paused'];
        for (const type of types) {
            try {
                await leadQueue.clean(0, type);
                console.log(`✅ Cleaned ${type} jobs`);
            } catch (e) {
                console.warn(`Could not clean ${type}: ${e.message}`);
            }
        }

        await leadQueue.resume();
        console.log("✅ Queue resumed (clean state).");

    } catch (error) {
        console.error("Error clearing queue:", error);
    }

    // Close connection
    await leadQueue.close();
    process.exit(0);
}

clearQueue().catch(err => {
    console.error("Top level error:", err);
    process.exit(1);
});
