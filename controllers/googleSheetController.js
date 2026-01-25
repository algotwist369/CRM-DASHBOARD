const axios = require("axios");
const GoogleSheetLead = require("../models/GoogleSheetLead");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const { sendWhatsAppTemplateDoubleTick, sendWhatsAppTextDoubleTick } = require("../utils/sendWhatsAppDoubleTick");

let locationCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache duration

const normalizePhoneNumber = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    // Standardize Indian numbers to 12 digits (91XXXXXXXXXX)
    if (cleaned.length === 10) {
        cleaned = "91" + cleaned;
    }
    return cleaned;
};


const parseCSV = (csvData) => {
    const lines = csvData.trim().split(/\r?\n/);
    const leads = [];

    // Skip header row (index 0) and process data rows
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

/**
 * Fetch managers for a specific location using fuzzy matching
 */
const getManagersForLocation = async (location, adminId) => {
    // Cache key must include adminId to prevent data leakage between admins
    const cacheKey = `${location}|${adminId}`;
    const now = Date.now();
    const cached = locationCache[cacheKey];

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
        return cached.managers;
    }

    try {
        // 1. Find businesses where branch fuzzy matches location AND belongs to this admin
        // Escape special regex chars to prevent crashes
        const escapedLoc = location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const businessQuery = {
            branch: { $regex: new RegExp(escapedLoc, "i") }, // Fuzzy match
            isActive: true
        };

        // If adminId is provided, filter by admin (Crucial for multi-tenant isolation)
        if (adminId) {
            businessQuery.admin = adminId;
        }

        const businesses = await Business.find(businessQuery).select('_id').lean();

        if (businesses.length === 0) {
            locationCache[cacheKey] = { managers: [], timestamp: now };
            return [];
        }

        const businessIds = businesses.map(b => b._id);

        // 2. Find active managers linked to these businesses
        const managers = await Manager.find({
            business: { $in: businessIds },
            isActive: true
        }).select('_id name phone email accessScope assignedBranches').lean();

        // 3. Filter managers based on access scope and branch assignment
        const managersForLocation = [];
        const seenManagerIds = new Set();
        const normalizedLoc = location.trim().toLowerCase();

        for (const manager of managers) {
            let hasAccess = false;

            if (manager.accessScope === 'all_branches' || manager.accessScope === 'own_branch') {
                hasAccess = true;
            } else if (manager.accessScope === 'specific_branches' && manager.assignedBranches) {
                // Fuzzy check: does any assigned branch contain the location string?
                hasAccess = manager.assignedBranches.some(
                    branch => branch.trim().toLowerCase().includes(normalizedLoc)
                );
            }

            if (hasAccess && !seenManagerIds.has(manager._id.toString())) {
                seenManagerIds.add(manager._id.toString());
                managersForLocation.push({
                    id: manager._id,
                    name: manager.name,
                    phone: manager.phone || ''
                });
            }
        }

        // Update cache
        locationCache[cacheKey] = { managers: managersForLocation, timestamp: now };

        return managersForLocation;
    } catch (error) {
        console.error(`[GoogleSheet] Error fetching managers for ${location}:`, error.message);
        return [];
    }
};

// ==========================================
// CONTROLLER FUNCTIONS
// ==========================================

/**
 * Sync Google Sheet data to database (Optimized Delta Sync)
 */
const syncGoogleSheet = async (req, res) => {
    try {
        const csvUrl = process.env.GOOGLE_SHEET_CSV_URL;

        if (!csvUrl) {
            return res.status(500).json({
                success: false,
                message: "Google Sheet CSV URL not configured"
            });
        }

        console.log(`[GoogleSheet Sync] Starting sync...`);

        const response = await axios.get(csvUrl, {
            timeout: 10000,
            headers: { 'User-Agent': 'CRM-Dashboard/1.0' }
        });

        const leads = parseCSV(response.data);
        console.log(`[GoogleSheet Sync] Parsed ${leads.length} leads`);

        if (leads.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No data to sync",
                stats: { total: 0, new: 0, updated: 0, unchanged: 0, errors: 0 }
            });
        }

        // =========================================================
        // DELTA SYNC STRATEGY (Performance Optimization)
        // =========================================================
        // 1. Fetch minimal data for all existing leads to compare
        //    (id, location, phone, name)
        //    We use lean() for performance and only select needed fields
        const existingLeads = await GoogleSheetLead.find({})
            .select('location customerPhone customerName')
            .lean();

        // 2. Create a fast lookup map: "Location|Phone" -> { customerName, _id }
        //    This avoids O(N*M) complexity and makes comparisons O(1)
        const existingMap = new Map();
        existingLeads.forEach(lead => {
            const key = `${lead.location}|${lead.customerPhone}`;
            existingMap.set(key, lead);
        });

        const bulkOps = [];
        let newCount = 0;
        let updatedCount = 0;
        let unchangedCount = 0;

        // 3. Iterate CSV rows and determine action
        const leadsToNotify = [];

        for (const lead of leads) {
            const key = `${lead.location}|${lead.customerPhone}`;
            const existing = existingMap.get(key);

            if (!existing) {
                // CASE: NEW RECORD
                newCount++;
                leadsToNotify.push(lead); // Queue for WhatsApp notification
                bulkOps.push({
                    insertOne: {
                        document: {
                            location: lead.location,
                            customerPhone: lead.customerPhone,
                            createdAt: new Date(), // Explicitly set createdAt for new records via upsert
                            customerName: lead.customerName,
                            syncedAt: new Date(),
                            lastModified: new Date()
                        }
                    }
                });
            } else {
                // CASE: EXISTING RECORD - CHECK FOR CHANGES
                // Only update if name changed or other fields differ
                if (existing.customerName !== lead.customerName) {
                    updatedCount++;
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: existing._id }, // More efficient to update by _id
                            update: {
                                $set: {
                                    customerName: lead.customerName,
                                    syncedAt: new Date(),
                                    lastModified: new Date()
                                }
                            }
                        }
                    });
                } else {
                    // CASE: NO CHANGE
                    // Skip entirely - Zero DB Write!
                    unchangedCount++;
                }
            }
        }

        // 4. Executing Bulk Writes only if needed
        let result = { upsertedCount: 0, modifiedCount: 0 };
        if (bulkOps.length > 0) {
            console.log(`[GoogleSheet Sync] Executing ${bulkOps.length} DB operations...`);
            result = await GoogleSheetLead.bulkWrite(bulkOps, { ordered: false });
        } else {
            console.log(`[GoogleSheet Sync] No changes detected. All ${unchangedCount} records up to date.`);
        }

        // =========================================================
        // WHATSAPP NOTIFICATION LOGIC (New Feature)
        // =========================================================
        if (leadsToNotify.length > 0) {
            console.log(`[GoogleSheet Sync] 🔔 Sending WhatsApp notifications for ${leadsToNotify.length} new leads...`);

            // 1. Get unique locations for new leads to minimize DB calls
            const uniqueLocations = [...new Set(leadsToNotify.map(l => l.location))];

            // 2. Fetch managers for these locations (Pass null for adminId to get ALL managers for location)
            //    We want to notify ALL managers assigned to "Vashi" regardless of admin context here
            const managerMap = {};

            await Promise.all(uniqueLocations.map(async (loc) => {
                managerMap[loc] = await getManagersForLocation(loc, null);
            }));

            // 3. Send WhatsApps
            // We use Promise.allSettled to ensure one failure doesn't stop others
            const notificationPromises = [];

            for (const lead of leadsToNotify) {
                const managers = managerMap[lead.location] || [];

                if (managers.length > 0) {
                    for (const manager of managers) {
                        if (manager.phone) {
                            notificationPromises.push(
                                sendWhatsAppTemplateDoubleTick({
                                    to: manager.phone,
                                    templateName: 'leads_forward_v2',
                                    placeholders: [
                                        lead.customerName || 'Customer', // {{customer_name}}
                                        lead.location,                   // {{Location}}
                                        lead.customerPhone               // {{customer_phone}}
                                    ]
                                })
                            );
                        }
                    }
                }
            }

            Promise.allSettled(notificationPromises).then(results => {
                const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                console.log(`[GoogleSheet Sync] 🔔 Notifications Sent: ${sent} / ${notificationPromises.length}`);
            });
        }

        const stats = {
            total: leads.length,
            new: newCount,
            updated: updatedCount,
            unchanged: unchangedCount,
            errors: 0
        };

        // Clear manager location cache on sync IF data actually changed
        // This prevents cache invalidation on "no-change" syncs
        if (stats.new > 0 || stats.updated > 0) {
            locationCache = {};
        }

        console.log(`[GoogleSheet Sync] Done - New: ${stats.new}, Updated: ${stats.updated}, Unchanged: ${stats.unchanged}`);

        res.status(200).json({
            success: true,
            message: "Sync completed successfully",
            stats,
            lastSyncTime: new Date()
        });

    } catch (error) {
        console.error("[GoogleSheet Sync] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to sync Google Sheet data",
            error: error.message
        });
    }
};

/**
 * Get all Google Sheet leads with pagination and filtering
 */
const getAllLeads = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            location,
            search,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        // 1. Build Query
        const query = {};
        if (location && location !== "All") query.location = location;
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: "i" } },
                { customerPhone: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

        // 2. Fetch Data (Parallel Execution)
        const [leads, total, allLocations] = await Promise.all([
            GoogleSheetLead.find(query).sort(sortOptions).limit(limitNum).skip(skip).lean(),
            GoogleSheetLead.countDocuments(query),
            GoogleSheetLead.distinct("location") // Keep fetching all distinct for filter dropdown
        ]);

        // 3. Optimize Manager Fetching
        // Only fetch managers for locations PRESENT ON THE CURRENT PAGE
        const uniquePageLocations = [...new Set(leads.map(l => l.location))];

        // Extract admin ID from request (set by auth middleware)
        // This ensures managers are filtered by the current admin's businesses
        const adminId = req.user ? req.user.id : null;

        // Execute manager fetches in parallel
        const managerResults = await Promise.all(
            uniquePageLocations.map(async (loc) => ({
                location: loc,
                managers: await getManagersForLocation(loc, adminId)
            }))
        );

        // Map results to a dictionary for O(1) lookup
        const locationManagerMap = managerResults.reduce((acc, curr) => {
            acc[curr.location] = curr.managers;
            return acc;
        }, {});

        // 4. Attach manager data to leads
        const enhancedLeads = leads.map(lead => ({
            ...lead,
            managers: locationManagerMap[lead.location] || [],
            totalManagers: (locationManagerMap[lead.location] || []).length
        }));

        res.status(200).json({
            success: true,
            data: enhancedLeads,
            pagination: {
                total,
                page: parseInt(page),
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            },
            filters: {
                locations: ["All", ...allLocations.sort()]
            }
        });

    } catch (error) {
        console.error("[GoogleSheet Leads] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch leads",
            error: error.message
        });
    }
};

/**
 * Manual sync trigger endpoint
 */
const manualSync = async (req, res) => {
    await syncGoogleSheet(req, res);
};

/**
 * Manual forward lead to managers (All or Specific)
 */
// const forwardLeadToManagers = async (req, res) => {
//     try {
//         const { lead, managerIds, location } = req.body;

//         if (!lead || !location) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing lead data or location"
//             });
//         }

//         let targetManagers = [];

//         // 1. Determine Target Managers
//         if (managerIds === 'all') {
//             // Fetch ALL managers for this location
//             targetManagers = await getManagersForLocation(location, null);
//         } else if (Array.isArray(managerIds) && managerIds.length > 0) {
//             // Fetch Specific Managers
//             // We can reuse getManagersForLocation but filter manually, or just query DB directly.
//             // For consistency and caching, let's get all for location and filter by ID.
//             const allManagers = await getManagersForLocation(location, null);
//             targetManagers = allManagers.filter(m => managerIds.includes(m.id.toString()));
//         }

//         if (targetManagers.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No active managers found for this location to forward to."
//             });
//         }

//         // 2. Send WhatsApp Messages
//         const notificationPromises = [];

//         for (const manager of targetManagers) {
//             if (manager.phone) {
//                 // Prepare safe placeholders
//                 const p1 = String(lead.customerName || 'Customer');
//                 const p2 = String(lead.customerPhone || 'N/A');
//                 const p3 = String(lead.location || 'Unknown Location');

//                 console.log(`[Forward Lead] Sending to ${manager.name} (${manager.phone}) | Data: ${p1}, ${p2}, ${p3}`);

//                 // Send and track individual promise
//                 const promise = sendWhatsAppTemplateDoubleTick({
//                     to: manager.phone,
//                     templateName: 'new_enquiry',
//                     placeholders: [p1, p2, p3] // Order: Name, Phone, Location
//                 }).then(res => ({
//                     managerId: manager.id,
//                     success: res.success,
//                     error: res.error
//                 })).catch(err => ({
//                     managerId: manager.id,
//                     success: false,
//                     error: err.message
//                 }));

//                 notificationPromises.push(promise);
//             }
//         }

//         const outcomes = await Promise.all(notificationPromises);
//         const successCount = outcomes.filter(o => o.success).length;

//         // 3. Response
//         res.status(200).json({
//             success: true,
//             message: `Lead forwarded to ${successCount}/${targetManagers.length} managers.`,
//             details: outcomes
//         });

//     } catch (error) {
//         console.error("[Forward Lead] Error:", error.message);
//         res.status(500).json({
//             success: false,
//             message: "Failed to forward lead",
//             error: error.message
//         });
//     }
// };

const forwardLeadToManagers = async (req, res) => {
    try {
        const { lead, managerIds, location } = req.body;

        if (!lead || !location) {
            return res.status(400).json({
                success: false,
                message: "Missing lead data or location"
            });
        }

        let targetManagers = [];

        // 1. Determine Target Managers
        if (managerIds === 'all') {
            targetManagers = await getManagersForLocation(location, null);
        }
        else if (Array.isArray(managerIds) && managerIds.length > 0) {
            const allManagers = await getManagersForLocation(location, null);
            targetManagers = allManagers.filter(m =>
                managerIds.includes(m.id.toString())
            );
        }

        if (!targetManagers.length) {
            return res.status(404).json({
                success: false,
                message: "No active managers found for this location."
            });
        }

        // 2. Send WhatsApp Messages
        const notificationPromises = targetManagers
            .filter(m => m.phone)
            .map(async manager => {
                const p1 = lead.customerName?.trim() || "Customer";
                const p2 = lead.customerPhone?.trim() || "N/A";
                const p3 = lead.location?.trim() || location;

                console.log(
                    `[Forward Lead] ${manager.name} (${manager.phone}) →`,
                    p1, p2, p3
                );

                try {
                    const r = await sendWhatsAppTemplateDoubleTick({
                        to: manager.phone,
                        templateName: "new_enquiry",
                        placeholders: [p1, p2, p3] // MUST MATCH {{1}}, {{2}}, {{3}}
                    });

                    console.log("[Forward Lead] WhatsApp Response:", r);
                    return ({
                        managerId: manager.id,
                        success: true
                    });
                } catch (err) {
                    return ({
                        managerId: manager.id,
                        success: false,
                        error: err.message
                    });
                }
            });

        const outcomes = await Promise.all(notificationPromises);
        const successCount = outcomes.filter(o => o.success).length;

        return res.status(200).json({
            success: true,
            message: `Lead forwarded to ${successCount}/${targetManagers.length} managers.`,
            details: outcomes
        });

    } catch (error) {
        console.error("[Forward Lead] Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to forward lead",
            error: error.message
        });
    }
};


module.exports = {
    syncGoogleSheet,
    getAllLeads,
    manualSync,
    getManagersForLocation, // Exported for use in sync service
    forwardLeadToManagers
};
