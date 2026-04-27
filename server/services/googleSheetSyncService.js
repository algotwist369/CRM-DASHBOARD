const axios = require("axios");
const GoogleSheetLead = require("../models/GoogleSheetLead");
const { getManagersForLocation } = require("../controllers/googleSheetController");
const { sendWhatsAppTemplateDoubleTick } = require("../utils/sendWhatsAppDoubleTick");

let syncInterval = null;

/**
 * Parse CSV data into array of objects (Shared Helper Logic)
 */
const parseCSV = (csvData) => {
    const lines = csvData.trim().split(/\r?\n/);
    const leads = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(/\t|,/);
        const location = values[0]?.trim() || "";
        const customerPhone = values[1]?.trim() || "";
        const customerName = values[2]?.trim() || "";

        if (location && customerPhone) {
            leads.push({
                location,
                customerPhone: normalizePhoneNumber(customerPhone),
                customerName
            });
        }
    }
    return leads;
};

const normalizePhoneNumber = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) cleaned = "91" + cleaned;
    return cleaned;
};

/**
 * Sync function that runs in background (Optimized + Notifications)
 */
const performSync = async () => {
    try {
        const csvUrl = process.env.GOOGLE_SHEET_CSV_URL;

        if (!csvUrl) {
            console.warn("[GoogleSheet Auto-Sync] CSV URL not configured");
            return;
        }

        console.log(`[GoogleSheet Auto-Sync] Starting sync at ${new Date().toLocaleString()}`);

        const response = await axios.get(csvUrl, { timeout: 10000, headers: { 'User-Agent': 'CRM-Dashboard/1.0' } });
        const leads = parseCSV(response.data);

        if (leads.length === 0) {
            console.log("[GoogleSheet Auto-Sync] No data to sync");
            return;
        }

        // DELTA SYNC STRATEGY
        const existingLeads = await GoogleSheetLead.find({}).select('location customerPhone customerName').lean();
        const existingMap = new Map();
        existingLeads.forEach(lead => existingMap.set(`${lead.location}|${lead.customerPhone}`, lead));

        const bulkOps = [];
        const leadsToNotify = [];
        let newCount = 0;
        let updatedCount = 0;

        for (const lead of leads) {
            const key = `${lead.location}|${lead.customerPhone}`;
            const existing = existingMap.get(key);

            if (!existing) {
                newCount++;
                leadsToNotify.push(lead);
                bulkOps.push({
                    insertOne: {
                        document: {
                            location: lead.location,
                            customerPhone: lead.customerPhone,
                            createdAt: new Date(),
                            customerName: lead.customerName,
                            syncedAt: new Date(),
                            lastModified: new Date()
                        }
                    }
                });
            } else if (existing.customerName !== lead.customerName) {
                updatedCount++;
                bulkOps.push({
                    updateOne: {
                        filter: { _id: existing._id },
                        update: { $set: { customerName: lead.customerName, syncedAt: new Date(), lastModified: new Date() } }
                    }
                });
            }
        }

        if (bulkOps.length > 0) {
            await GoogleSheetLead.bulkWrite(bulkOps, { ordered: false });
        }

        console.log(`[GoogleSheet Auto-Sync] ✓ Sync Stats - New: ${newCount}, Updated: ${updatedCount}`);

        // WHATSAPP NOTIFICATIONS
        if (leadsToNotify.length > 0) {
            console.log(`[GoogleSheet Auto-Sync] 🔔 Sending notifications for ${leadsToNotify.length} new leads...`);
            const uniqueLocations = [...new Set(leadsToNotify.map(l => l.location))];

            // Fetch managers (adminId = null for global lookup)
            const managerMap = {};
            await Promise.all(uniqueLocations.map(async (loc) => {
                managerMap[loc] = await getManagersForLocation(loc, null);
            }));

            const notificationPromises = [];
            for (const lead of leadsToNotify) {
                const managers = managerMap[lead.location] || [];
                for (const manager of managers) {
                    if (manager.phone) {
                        notificationPromises.push(sendWhatsAppTemplateDoubleTick({
                            to: manager.phone,
                            templateName: 'new_lead',
                            placeholders: [
                                String(lead.customerName || 'Customer'),
                                String(lead.customerPhone || 'N/A'),
                                String(lead.location || 'Location')
                            ]
                        }));
                    }
                }
            }

            Promise.allSettled(notificationPromises).then(results => {
                const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                console.log(`[GoogleSheet Auto-Sync] 🔔 Notifications Sent: ${sent}`);
            });
        }

    } catch (error) {
        console.error("[GoogleSheet Auto-Sync] ✗ Error:", error.message);
    }
};

const startGoogleSheetSync = () => {
    if (syncInterval) return;
    performSync(); // Initial run
    syncInterval = setInterval(performSync, 120000); // Increased to 2 minutes
    console.log("[GoogleSheet Auto-Sync] ✓ Service started (2m interval)");
};

const stopGoogleSheetSync = () => {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
};

module.exports = { startGoogleSheetSync, stopGoogleSheetSync };
