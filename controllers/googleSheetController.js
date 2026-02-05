const axios = require("axios");
const GoogleSheetLead = require("../models/GoogleSheetLead");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const { sendWhatsAppTemplateDoubleTick } = require("../utils/sendWhatsAppDoubleTick");
const { emitToRole } = require("../config/socket");

let locationCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache duration

const normalizePhoneNumber = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
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

// Fetch managers for a specific location using fuzzy matching
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
            $or: [
                { branch: { $regex: new RegExp(escapedLoc, "i") } }, // Fuzzy match branch
                { name: { $regex: new RegExp(escapedLoc, "i") } },   // Fuzzy match business name
                { city: { $regex: new RegExp(escapedLoc, "i") } }    // Fuzzy match city
            ],
            isActive: true
        };

        // If adminId is provided, filter by admin (Crucial for multi-tenant isolation)
        if (adminId) {
            businessQuery.admin = adminId;
        }

        // Fetch branch, name, city info too for permission checking
        const businesses = await Business.find(businessQuery).select('_id branch name city').lean();

        if (businesses.length === 0) {
            locationCache[cacheKey] = { managers: [], timestamp: now };
            return [];
        }

        const businessIds = businesses.map(b => b._id);
        const businessMap = {};
        businesses.forEach(b => businessMap[b._id.toString()] = b);

        // 2. Find active managers linked to these businesses
        const managers = await Manager.find({
            business: { $in: businessIds },
            isActive: true
        }).select('_id name phone email accessScope assignedBranches business').lean();

        // 3. Filter managers based on access scope and branch assignment
        const managersForLocation = [];
        const seenManagerIds = new Set();

        for (const manager of managers) {
            let hasAccess = false;

            // Get the specific business context this manager was found under
            const linkedBusiness = businessMap[manager.business.toString()];
            if (!linkedBusiness) continue;

            if (manager.accessScope === 'all_branches' || manager.accessScope === 'own_branch') {
                hasAccess = true;
            } else if (manager.accessScope === 'specific_branches' && manager.assignedBranches) {
                // Check if the business's branch is in the manager's assigned list
                const currentBranch = linkedBusiness.branch.trim().toLowerCase();
                hasAccess = manager.assignedBranches.some(
                    assigned => assigned.trim().toLowerCase() === currentBranch ||
                        currentBranch.includes(assigned.trim().toLowerCase())
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

// Sync Google Sheet data to database (Optimized Delta Sync)
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
                                        lead.customerName || 'Customer',
                                        lead.location,
                                        lead.customerPhone
                                    ]
                                })
                            );
                        }
                    }
                }
            }

            Promise.allSettled(notificationPromises).then(results => {
                const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                console.log(`[GoogleSheet Sync] 🔔Notifications Sent: ${sent} / ${notificationPromises.length}`);
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

// Get all Google Sheet leads with pagination and filtering
const getAllLeads = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            location,
            search,
            status, // New Param
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        // 1. Build Query
        const query = {};
        if (location && location !== "All") query.location = location;

        // Status Filter Logic
        if (status && status !== "All") {
            if (status === "Done") {
                query.status = "done";
            } else if (status === "Sent") {
                query.status = "forwarded";
            } else if (status === "Pending") {
                query.status = { $nin: ["done", "forwarded"] };
            }
        }

        if (search) {
            // Text Search Optimization: use Full Text Search if available
            // Note: $text requires the text index we added.
            // If strict text match is needed: query.$text = { $search: search };
            // But usually users want substring match. 
            // For 10M+ with regex, we MUST rely on the regex running on an indexed field.
            // We have indexed customerName and customerPhone.

            // Try to use prefix match which is index-friendly: ^value
            const isNumeric = /^\d+$/.test(search);
            if (isNumeric) {
                // Exact or Prefix match for phone is fast with index
                query.customerPhone = { $regex: `^${search}`, $options: "i" };
            } else {
                query.$or = [
                    { customerName: { $regex: search, $options: "i" } },
                    // Also fallback to phone search if mixed
                    { customerPhone: { $regex: search, $options: "i" } }
                ];
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

        // 2. Fetch Data (Parallel Execution)
        // Optimization: Use estimatedDocumentCount for total valid connection if no filter
        let totalCountPromise;
        if (Object.keys(query).length === 0) {
            totalCountPromise = GoogleSheetLead.estimatedDocumentCount();
        } else {
            totalCountPromise = GoogleSheetLead.countDocuments(query);
        }

        const [leads, total, allLocations] = await Promise.all([
            GoogleSheetLead.find(query).sort(sortOptions).limit(limitNum).skip(skip).lean(),
            totalCountPromise,
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

// Manual sync trigger endpoint
const manualSync = async (req, res) => {
    await syncGoogleSheet(req, res);
};

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

        // Update lead status if at least one message was sent successfully
        if (successCount > 0) {
            await GoogleSheetLead.findByIdAndUpdate(lead._id, {
                status: 'forwarded',
                statusUpdatedAt: new Date(),
                lastModified: new Date()
            });
        }

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

// ==========================================
// FUNCTION 1: Manager Views Leads by Location
// ==========================================
// This function allows a manager to see only leads for their assigned location(s)
// If a location has multiple managers, all of them can see all leads for that location
// Includes manager call/whatsapp tracking information
const getLeadsForManager = async (req, res) => {
    try {
        const managerId = req.user?.id; // Extracted from auth middleware
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
            filterByStatus, // 'called', 'whatsapped', 'pending', 'all'
            status // 'Done', 'Sent', 'Pending', 'All'
        } = req.query;

        if (!managerId) {
            return res.status(401).json({
                success: false,
                message: "Manager ID not found in request"
            });
        }

        // 1. Fetch manager details with business populated
        const manager = await Manager.findById(managerId)
            .select('assignedBranches accessScope business isActive name phone')
            .populate('business', 'name branch')
            .lean();

        if (!manager || !manager.isActive) {
            return res.status(403).json({
                success: false,
                message: "Manager not found or inactive"
            });
        }

        // 2. Determine allowed locations based on manager's business branch
        // Priority: business.branch > accessScope > assignedBranches
        let allowedLocations = [];

        console.log(`[DEBUG] Manager ID: ${managerId}`);
        console.log(`[DEBUG] Manager accessScope: ${manager.accessScope}`);
        console.log(`[DEBUG] Manager business:`, manager.business);

        // First priority: If manager has a business with a branch, use that
        if (manager.business && manager.business.branch) {
            allowedLocations = [manager.business.branch];
            console.log(`[DEBUG] Using business branch for filtering:`, manager.business.branch);
        }
        // Second priority: Check accessScope for admin/regional managers without specific business
        else if (manager.accessScope === 'all_branches') {
            // Only allow all_branches access if no specific business is assigned
            allowedLocations = await GoogleSheetLead.distinct('location');
            console.log(`[DEBUG] Manager has 'all_branches' access (no business), allowedLocations:`, allowedLocations);
        }
        // Third priority: Fall back to assignedBranches
        else if (manager.assignedBranches && manager.assignedBranches.length > 0) {
            allowedLocations = manager.assignedBranches;
            console.log(`[DEBUG] Fallback to assignedBranches:`, allowedLocations);
        }

        if (allowedLocations.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                pagination: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: 0
                },
                message: "No locations assigned to this manager"
            });
        }

        // 3. Build query with location filter and optional search
        // Use case-insensitive regex to handle variations like "Kharghar" vs "KHARGHAR"
        // Also trim() to handle potential whitespace issues
        const locationRegexes = allowedLocations.map(loc => new RegExp(`^${loc.trim()}$`, 'i'));

        const query = {
            location: { $in: locationRegexes }
        };

        // Manager Specific Status Filtering
        if (status && status !== "All") {
            if (status === "Done") {
                // Done by THIS manager
                query.managerStatus = { $elemMatch: { managerId: managerId } };
            } else if (status === "Sent") {
                query.status = "forwarded";
            } else if (status === "Pending") {
                // Not done by THIS manager (and not forwarded)
                query.managerStatus = { $not: { $elemMatch: { managerId: managerId } } };
                query.status = { $ne: "forwarded" };
            }
        }


        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: "i" } },
                { customerPhone: { $regex: search, $options: "i" } }
            ];
        }

        // 4. Apply status filter (original - called, whatsapped, pending)
        if (filterByStatus && filterByStatus !== 'all') {
            if (filterByStatus === 'called') {
                query.isCalled = true;
            } else if (filterByStatus === 'whatsapped') {
                query.isWhatsapp = true;
            } else if (filterByStatus === 'pending') {
                query.isCalled = false;
                query.isWhatsapp = false;
            }
        }

        // 5. Pagination and sorting
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

        // 6. Fetch leads and total count
        const [leads, total] = await Promise.all([
            GoogleSheetLead.find(query)
                .sort(sortOptions)
                .limit(limitNum)
                .skip(skip)
                .lean(),
            GoogleSheetLead.countDocuments(query)
        ]);

        // 7. Manually fetch manager details (can't use populate due to separate DB)
        const managerIds = new Set();
        leads.forEach(lead => {
            if (Array.isArray(lead.isCalledBy)) {
                lead.isCalledBy.forEach(id => managerIds.add(id.toString()));
            } else if (lead.isCalledBy) {
                managerIds.add(lead.isCalledBy.toString());
            }

            if (Array.isArray(lead.isWhatsappBy)) {
                lead.isWhatsappBy.forEach(id => managerIds.add(id.toString()));
            } else if (lead.isWhatsappBy) {
                managerIds.add(lead.isWhatsappBy.toString());
            }
        });

        const managers = await Manager.find({ _id: { $in: Array.from(managerIds) } })
            .select('name phone')
            .lean();

        const managerMap = {};
        managers.forEach(m => {
            managerMap[m._id.toString()] = m;
        });

        // 8. Enhance lead data with PROTECTED VISIBILITY
        const enhancedLeads = leads.map(lead => {
            const isCalledArray = Array.isArray(lead.isCalledBy) ? lead.isCalledBy : (lead.isCalledBy ? [lead.isCalledBy] : []);
            const isWhatsappArray = Array.isArray(lead.isWhatsappBy) ? lead.isWhatsappBy : (lead.isWhatsappBy ? [lead.isWhatsappBy] : []);

            const amICalled = isCalledArray.some(id => id.toString() === managerId);
            const amIWhatsapp = isWhatsappArray.some(id => id.toString() === managerId);

            const showCalled = amICalled;
            const showWhatsapp = amIWhatsapp;

            return {
                ...lead,
                // Redact all other manager statuses, only show mine if exists
                managerStatus: lead.managerStatus?.filter(ms => ms.managerId?.toString() === managerId) || [],

                // Override global flags
                isCalled: showCalled,
                isWhatsapp: showWhatsapp,
                status: showCalled ? 'called' : (showWhatsapp ? 'whatsapped' : 'pending'),

                // Hide Details of others
                callDetails: showCalled ? {
                    managerId: managerId,
                    managerName: manager.name,
                    managerPhone: manager.phone
                } : null,

                whatsappDetails: showWhatsapp ? {
                    managerId: managerId,
                    managerName: manager.name,
                    managerPhone: manager.phone
                } : null,

                // Redact sensitive global fields
                isCalledBy: undefined,
                isWhatsappBy: undefined,
                statusUpdatedBy: undefined
            };
        });

        res.status(200).json({
            success: true,
            data: enhancedLeads,
            pagination: {
                total,
                page: parseInt(page),
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            },
            manager: {
                id: managerId,
                assignedLocations: allowedLocations,
                accessScope: manager.accessScope
            }
        });

    } catch (error) {
        console.error("[Get Leads For Manager] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch leads for manager",
            error: error.message
        });
    }
};

// ==========================================
// FUNCTION 2: Update Call/WhatsApp Status
// ==========================================
// Admin/System can track which manager called or whatsapped a lead
// This function updates the lead with manager tracking information
const updateLeadContactStatus = async (req, res) => {
    try {
        const managerId = req.user?.id; // Current manager making the update
        const { leadId, contactType } = req.body; // contactType: 'call' or 'whatsapp'

        if (!managerId) {
            return res.status(401).json({
                success: false,
                message: "Manager ID not found in request"
            });
        }

        if (!leadId || !contactType || !['call', 'whatsapp'].includes(contactType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leadId or contactType. contactType must be 'call' or 'whatsapp'"
            });
        }

        // 1. Fetch the lead
        const lead = await GoogleSheetLead.findById(leadId);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        // 2. Verify manager has access to this lead's location
        const manager = await Manager.findById(managerId)
            .select('assignedBranches accessScope name') // Just added name here
            .lean();

        if (!manager) {
            return res.status(403).json({
                success: false,
                message: "Manager not found"
            });
        }

        // Check if manager has access to this location
        const hasAccess = manager.accessScope === 'all_branches' ||
            (manager.assignedBranches && manager.assignedBranches.some(
                branch => branch.trim().toLowerCase() === lead.location.trim().toLowerCase()
            ));

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Manager does not have access to this lead's location"
            });
        }

        // 3. Update lead based on contact type
        const updatePayload = {
            lastModified: new Date()
        };

        const field = contactType === 'call' ? 'isCalledBy' : 'isWhatsappBy';
        try {
            // Attempt atomic update
            await GoogleSheetLead.findByIdAndUpdate(leadId, {
                $addToSet: { [field]: managerId }
            });
        } catch (err) {
            // Robust migration if legacy data (ObjectId) exists instead of array
            if (err.message.includes('non-array')) {
                const leadData = await GoogleSheetLead.findById(leadId).select(field).lean();
                const existingValue = leadData ? leadData[field] : null;

                // Convert single value or null to array
                const newArray = Array.isArray(existingValue) ? existingValue : (existingValue ? [existingValue] : []);

                // Explicitly set as array
                await GoogleSheetLead.findByIdAndUpdate(leadId, { $set: { [field]: newArray } });

                // Retry the addToSet
                await GoogleSheetLead.findByIdAndUpdate(leadId, { $addToSet: { [field]: managerId } });
            } else {
                throw err;
            }
        }

        if (contactType === 'call') {
            updatePayload.isCalled = true;
        } else if (contactType === 'whatsapp') {
            updatePayload.isWhatsapp = true;
        }

        // AUTO-UPDATE MAIN STATUS: If pending, mark as done
        if (lead.status === 'pending') {
            updatePayload.status = 'done';
            updatePayload.statusUpdatedAt = new Date();
            updatePayload.statusUpdatedBy = manager.name;
        }

        // MANAGER SPECIFIC STATUS TRACKING
        // Update the managerStatus array: Remove old entry for this manager, add new one
        await GoogleSheetLead.findByIdAndUpdate(leadId, {
            $pull: { managerStatus: { managerId: managerId } }
        });

        await GoogleSheetLead.findByIdAndUpdate(leadId, {
            $push: {
                managerStatus: {
                    managerId: managerId,
                    managerName: manager.name,
                    action: contactType,
                    timestamp: new Date()
                }
            }
        });

        const updatedLead = await GoogleSheetLead.findByIdAndUpdate(
            leadId,
            { $set: updatePayload },
            { new: true }
        ).lean();

        // Manually fetch manager details (can't use populate due to separate DB)
        let callDetails = null;
        let whatsappDetails = null;

        if (updatedLead.isCalledBy && updatedLead.isCalledBy.length > 0) {
            const managers = await Manager.find({ _id: { $in: updatedLead.isCalledBy } }).select('name').lean();
            callDetails = managers.map(m => ({
                managerId: m._id,
                managerName: m.name
            }));
        }

        if (updatedLead.isWhatsappBy && updatedLead.isWhatsappBy.length > 0) {
            const managers = await Manager.find({ _id: { $in: updatedLead.isWhatsappBy } }).select('name').lean();
            whatsappDetails = managers.map(m => ({
                managerId: m._id,
                managerName: m.name
            }));
        }

        res.status(200).json({
            success: true,
            message: `Lead ${contactType} status updated successfully`,
            data: {
                leadId: updatedLead._id,
                customerName: updatedLead.customerName,
                customerPhone: updatedLead.customerPhone,
                location: updatedLead.location,
                isCalled: updatedLead.isCalled,
                isWhatsapp: updatedLead.isWhatsapp,
                callDetails,
                whatsappDetails,
                lastModified: updatedLead.lastModified
            }
        });

        // Emit Socket.io event for real-time pending count update
        try {
            const adminCount = await GoogleSheetLead.countDocuments({
                status: { $in: ['pending', 'forwarded'] }
            });
            emitToRole('admin', 'admin:leads:pending:updated', { count: adminCount });

            // Emit to managers for this location
            const business = await Business.findOne({ branch: new RegExp((updatedLead.location || '').trim(), 'i') }).select('_id');
            if (business) {
                const managers = await Manager.find({ business: business._id }).select('_id');
                for (const mgr of managers) {
                    const managerCount = await GoogleSheetLead.countDocuments({
                        location: new RegExp(updatedLead.location, 'i'),
                        status: { $in: ['pending', 'forwarded'] }
                    });
                    emitToRole('manager', 'manager:leads:pending:updated', {
                        managerId: mgr._id.toString(),
                        count: managerCount
                    });
                }
            }
        } catch (socketErr) {
            console.error('Error emitting pending count update:', socketErr);
            // Don't fail the request if socket emit fails
        }

    } catch (error) {
        console.error("[Update Lead Contact Status] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update lead contact status",
            error: error.message
        });
    }
};

// ==========================================
// FUNCTION 3: Admin View - See All Leads with Manager Tracking
// ==========================================
// Admin can see all leads across all locations with details about which manager
// called or whatsapped each lead. Useful for monitoring and analytics.
const getLeadsForAdmin = async (req, res) => {
    try {
        const adminId = req.user?.id; // Extracted from auth middleware
        const {
            page = 1,
            limit = 10,
            location,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
            filterByStatus, // 'called', 'whatsapped', 'pending', 'all' (Legacy/Contact Filter)
            status // New Main Status Filter: 'Done', 'Sent', 'Pending', 'All'
        } = req.query;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Admin ID not found in request"
            });
        }

        // 1. Verify user is admin (optional - depends on your auth system)
        // const user = await User.findById(adminId).select('role').lean();
        // if (user?.role !== 'admin') {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Only admins can access this endpoint"
        //     });
        // }

        // 2. Build query with optional filters
        const query = {};

        if (location && location !== "All") {
            query.location = location;
        }

        // New Status Filter Logic (Global)
        if (status && status !== "All") {
            if (status === "Done") {
                query.status = "done";
            } else if (status === "Sent") {
                query.status = "forwarded";
            } else if (status === "Pending") {
                query.status = { $nin: ["done", "forwarded"] };
            }
        }

        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: "i" } },
                { customerPhone: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ];
        }

        // 3. Apply individual contact status filter (if used alongside)
        if (filterByStatus && filterByStatus !== 'all') {
            if (filterByStatus === 'called') {
                query.isCalled = true;
            } else if (filterByStatus === 'whatsapped') {
                query.isWhatsapp = true;
            } else if (filterByStatus === 'pending') {
                query.isCalled = false;
                query.isWhatsapp = false;
            }
        }

        // 4. Pagination and sorting
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

        // 5. Fetch leads WITHOUT populate (separate DB issue)
        const [leads, total, allLocations] = await Promise.all([
            GoogleSheetLead.find(query)
                .sort(sortOptions)
                .limit(limitNum)
                .skip(skip)
                .lean(),
            GoogleSheetLead.countDocuments(query),
            GoogleSheetLead.distinct('location')
        ]);

        // 6. Manually fetch manager details (can't use populate due to separate DB)
        const managerIds = new Set();
        leads.forEach(lead => {
            if (Array.isArray(lead.isCalledBy)) {
                lead.isCalledBy.forEach(id => managerIds.add(id.toString()));
            } else if (lead.isCalledBy) {
                managerIds.add(lead.isCalledBy.toString());
            }

            if (Array.isArray(lead.isWhatsappBy)) {
                lead.isWhatsappBy.forEach(id => managerIds.add(id.toString()));
            } else if (lead.isWhatsappBy) {
                managerIds.add(lead.isWhatsappBy.toString());
            }
        });

        const managers = await Manager.find({ _id: { $in: Array.from(managerIds) } })
            .select('name phone email business')
            .lean();

        const managerMap = {};
        managers.forEach(m => {
            managerMap[m._id.toString()] = m;
        });

        // 7. Enhance lead data with formatted manager information
        const enhancedLeads = leads.map(lead => ({
            _id: lead._id,
            customerName: lead.customerName,
            customerPhone: lead.customerPhone,
            location: lead.location,
            syncedAt: lead.syncedAt,
            createdAt: lead.createdAt,
            lastModified: lead.lastModified,
            status: lead.status, // Return the RAW database status for accurate tracking
            statusUpdatedAt: lead.statusUpdatedAt,
            statusUpdatedBy: lead.statusUpdatedBy,
            remarks: lead.remarks || [], // Return remarks history
            contactStatus: {
                isCalled: lead.isCalled,
                isWhatsapp: lead.isWhatsapp,
                derivedStatus: lead.isCalled ? 'called' : (lead.isWhatsapp ? 'whatsapped' : 'pending')
            },
            callDetails: (Array.isArray(lead.isCalledBy) ? lead.isCalledBy : (lead.isCalledBy ? [lead.isCalledBy] : [])).map(id => ({
                managerId: id,
                managerName: managerMap[id.toString()]?.name || 'Unknown'
            })),
            whatsappDetails: (Array.isArray(lead.isWhatsappBy) ? lead.isWhatsappBy : (lead.isWhatsappBy ? [lead.isWhatsappBy] : [])).map(id => ({
                managerId: id,
                managerName: managerMap[id.toString()]?.name || 'Unknown'
            }))
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
                locations: ["All", ...allLocations.sort()],
                statuses: ["all", "called", "whatsapped", "pending"]
            }
        });

    } catch (error) {
        console.error("[Get Leads For Admin] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch leads for admin",
            error: error.message
        });
    }
};

// ==========================================
// FUNCTION 4: Update Lead Status (Admin)
// ==========================================
// Allow admin to mark lead as 'done' or other statuses manually
const updateLeadAdminStatus = async (req, res) => {
    try {
        const { leadId, status } = req.body;

        if (!leadId || !['pending', 'forwarded', 'done'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leadId or status"
            });
        }

        // MANAGER SPECIFIC STATUS TRACKING
        if (req.user && req.user.role === 'manager') {
            if (status === 'done') {
                // Remove existing
                await GoogleSheetLead.findByIdAndUpdate(leadId, {
                    $pull: { managerStatus: { managerId: req.user.id } }
                });
                // Add new 'done' status
                await GoogleSheetLead.findByIdAndUpdate(leadId, {
                    $push: {
                        managerStatus: {
                            managerId: req.user.id,
                            managerName: req.user.name || 'Unknown',
                            action: 'done',
                            timestamp: new Date()
                        }
                    }
                });
            } else if (status === 'pending') {
                // Remove entry ensures it shows as 'new' for this manager
                await GoogleSheetLead.findByIdAndUpdate(leadId, {
                    $pull: { managerStatus: { managerId: req.user.id } }
                });
            }
        }

        const lead = await GoogleSheetLead.findByIdAndUpdate(
            leadId,
            {
                status: status,
                statusUpdatedAt: new Date(),
                statusUpdatedBy: req.user ? req.user.name : 'Unknown', // Track WHO updated it
                lastModified: new Date()
            },
            { new: true }
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `Lead status updated to ${status}`,
            data: lead
        });

        // Emit Socket.io event for real-time pending count update
        try {
            const adminCount = await GoogleSheetLead.countDocuments({
                status: { $in: ['pending', 'forwarded'] }
            });
            emitToRole('admin', 'admin:leads:pending:updated', { count: adminCount });

            // Emit to managers for this location if lead has location info
            if (lead.location) {
                const business = await Business.findOne({ branch: new RegExp(lead.location.trim(), 'i') }).select('_id');
                if (business) {
                    const managers = await Manager.find({ business: business._id }).select('_id');
                    for (const mgr of managers) {
                        const managerCount = await GoogleSheetLead.countDocuments({
                            location: new RegExp(lead.location, 'i'),
                            status: { $in: ['pending', 'forwarded'] }
                        });
                        emitToRole('manager', 'manager:leads:pending:updated', {
                            managerId: mgr._id.toString(),
                            count: managerCount
                        });
                    }
                }
            }
        } catch (socketErr) {
            console.error('Error emitting pending count update:', socketErr);
            // Don't fail the request if socket emit fails
        }
    } catch (error) {
        console.error("[Update Admin Status] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error.message
        });
    }
};

// ==========================================
// FUNCTION 5: Lead Analytics
// ==========================================
// Get counts for leads (Received, Sent/Forwarded, Pending, Done) by date range
const getLeadAnalytics = async (req, res) => {
    try {
        const { timeframe, startDate, endDate } = req.query; // timeframe: 'today', 'yesterday', 'custom'

        // 1. Determine Date Range
        const now = new Date();
        let queryStart = new Date();
        let queryEnd = new Date();

        if (timeframe === 'yesterday') {
            queryStart.setDate(now.getDate() - 1);
            queryStart.setHours(0, 0, 0, 0);
            queryEnd.setDate(now.getDate() - 1);
            queryEnd.setHours(23, 59, 59, 999);
        } else if (timeframe === 'custom' && startDate && endDate) {
            queryStart = new Date(startDate);
            queryStart.setHours(0, 0, 0, 0);
            queryEnd = new Date(endDate);
            queryEnd.setHours(23, 59, 59, 999);
        } else {
            // Default: Today
            queryStart.setHours(0, 0, 0, 0);
            queryEnd.setHours(23, 59, 59, 999);
        }

        // 2. Build Aggregation Query
        // Match leads created within the time range
        // Note: We use 'syncedAt' or 'createdAt' as the timestamp for "Received"
        const matchStage = {
            syncedAt: { $gte: queryStart, $lte: queryEnd }
        };

        const stats = await GoogleSheetLead.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalReceived: { $sum: 1 },
                    pending: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                    },
                    forwarded: {
                        $sum: { $cond: [{ $eq: ["$status", "forwarded"] }, 1, 0] }
                    },
                    done: {
                        $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : { totalReceived: 0, pending: 0, forwarded: 0, done: 0 };
        delete result._id; // Remove _id field

        res.status(200).json({
            success: true,
            data: result,
            dateRange: {
                start: queryStart,
                end: queryEnd,
                timeframe: timeframe || 'today'
            }
        });

    } catch (error) {
        console.error("[Lead Analytics] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch analytics",
            error: error.message
        });
    }
};

// ==========================================
// FUNCTION 6: Get Managers for Location
// ==========================================
const getManagersByLocation = async (req, res) => {
    try {
        const { location } = req.query;
        if (!location) {
            return res.status(400).json({ success: false, message: "Location is required" });
        }

        const managers = await getManagersForLocation(location, null); // adminId null to get all valid managers for loc

        res.status(200).json({
            success: true,
            data: managers
        });
    } catch (error) {
        console.error("[Get Managers] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch managers",
            error: error.message
        });
    }
};

// ==========================================
// FUNCTION 7: Add Remark
// ==========================================
const addLeadRemark = async (req, res) => {
    try {
        const { leadId, text } = req.body;
        if (!leadId || !text) {
            return res.status(400).json({ success: false, message: "Lead ID and Remark Text are required" });
        }

        const lead = await GoogleSheetLead.findByIdAndUpdate(
            leadId,
            {
                $push: {
                    remarks: {
                        text,
                        by: req.user ? req.user.name : 'Unknown',
                        createdAt: new Date()
                    }
                },
                $set: { lastModified: new Date() }
            },
            { new: true }
        );

        if (!lead) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }

        // EMIT REAL-TIME UPDATE
        try {
            const { emitToAll } = require('../config/socket');
            emitToAll('lead_remark_added', {
                leadId: lead._id,
                remarks: lead.remarks
            });
        } catch (socketError) {
            console.error("[Add Remark] Socket Emit Error:", socketError.message);
            // Don't fail the request if socket fails
        }

        res.status(200).json({
            success: true,
            message: "Remark added successfully",
            data: lead.remarks
        });

    } catch (error) {
        console.error("[Add Remark] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to add remark",
            error: error.message
        });
    }
};

// ==========================================
// FUNCTION 8: Double Tick Webhook (Direct API)
// ==========================================
const receiveWebhookLead = async (req, res) => {
    try {
        console.log("[Webhook] Received Payload:", JSON.stringify(req.body));

        // 1. Extract Data
        // Support multiple field names just in case (Double Tick might send 'phone', 'mobile', etc if configured differently)
        let { location, customerPhone, customerName, phone, mobile, name } = req.body;

        customerPhone = customerPhone || phone || mobile;
        customerName = customerName || name || "Customer";

        if (!location || !customerPhone) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: location and customerPhone"
            });
        }

        // 2. Normalize Data
        const normalizedPhone = normalizePhoneNumber(customerPhone);
        const trimmedLocation = location.trim();

        // 3. Upsert Lead (Insert if new, Update if exists)
        // We use findOneAndUpdate to atomically handle duplicates
        const now = new Date();
        const lead = await GoogleSheetLead.findOneAndUpdate(
            {
                location: trimmedLocation,
                customerPhone: normalizedPhone
            },
            {
                $set: {
                    customerName: customerName.trim(),
                    lastModified: now,
                    syncedAt: now, // Treat this as a sync event
                },
                $setOnInsert: {
                    createdAt: now,
                    status: 'pending',
                    isCalled: false,
                    isWhatsapp: false
                }
            },
            {
                new: true, // Return the modified document
                upsert: true, // Create if not exists
                includeResultMetadata: true // Mongoose 7+ to get lastErrorObject
            }
        );

        console.log("[Webhook] DB Result:", JSON.stringify(lead));

        // Check if it was an insert or update
        // Mongoose 8 returns { value, lastErrorObject, ok }
        const isNew = !lead?.lastErrorObject?.updatedExisting;
        const leadDoc = lead?.value;

        if (!leadDoc) {
            console.error("[Webhook] No lead document returned!");
            return res.status(500).json({ success: false, message: "Database error: No document returned" });
        }

        // 4. Trigger Notifications if NEW
        if (isNew) {
            console.log(`[Webhook] 🔔 New Lead Created: ${trimmedLocation} - ${normalizedPhone}. Notifying managers...`);

            // Fetch managers for this location
            const managers = await getManagersForLocation(trimmedLocation, null);

            if (managers.length > 0) {
                const notificationPromises = [];
                for (const manager of managers) {
                    if (manager.phone) {
                        notificationPromises.push(
                            sendWhatsAppTemplateDoubleTick({
                                to: manager.phone,
                                templateName: 'leads_forward_v2',
                                placeholders: [
                                    leadDoc.customerName || 'Customer',
                                    trimmedLocation,
                                    normalizedPhone
                                ]
                            })
                        );
                    }
                }

                // Execute notifications in background (don't block response)
                Promise.allSettled(notificationPromises).then(results => {
                    const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                    console.log(`[Webhook] 🔔 Notifications Sent: ${sent} / ${notificationPromises.length}`);
                });
            } else {
                console.log(`[Webhook] No managers found for location: ${trimmedLocation}`);
            }
        } else {
            console.log(`[Webhook] Existing Lead Updated: ${trimmedLocation} - ${normalizedPhone}`);
        }

        res.status(200).json({
            success: true,
            message: isNew ? "Lead created and processed" : "Lead updated",
            data: {
                id: leadDoc._id,
                isNew
            }
        });

    } catch (error) {
        console.error("[Webhook] Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to process webhook",
            error: error.message
        });
    }
};

// ==========================================
// FUNCTION 9: Get Pending Leads Count (Admin)
// ==========================================
// Returns total count of pending leads across all locations for admin sidebar badge
const getPendingLeadsCountAdmin = async (req, res) => {
    try {
        const count = await GoogleSheetLead.countDocuments({
            status: { $in: ['pending', 'forwarded'] }
        });

        return res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error fetching admin pending leads count:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch pending leads count',
            error: error.message
        });
    }
};

// ==========================================
// FUNCTION 10: Get Pending Leads Count (Manager)
// ==========================================
// Returns count of pending leads for manager's assigned location(s) for sidebar badge
const getPendingLeadsCountManager = async (req, res) => {
    try {
        const managerId = req.user.id;

        // Get manager's business/location
        const manager = await Manager.findById(managerId).select('business');
        if (!manager || !manager.business) {
            console.log('Manager pending count: Manager or business not found', { managerId, manager });
            return res.status(404).json({
                success: false,
                message: 'Manager or business not found'
            });
        }

        // Get location name from business (branch name acts as location identifier)
        const business = await Business.findById(manager.business).select('branch');
        if (!business || !business.branch) {
            console.log('Manager pending count: Business branch not found', { business });
            return res.status(404).json({
                success: false,
                message: 'Business branch not found'
            });
        }

        const locationName = business.branch.trim();
        console.log(`Manager pending count: Search location '${locationName}' for manager ${managerId}`);

        // Count pending leads for this location
        const count = await GoogleSheetLead.countDocuments({
            location: new RegExp(locationName, 'i'),
            status: { $in: ['pending', 'forwarded'] }
        });
        console.log(`Manager pending count result: ${count}`);

        return res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error fetching manager pending leads count:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch pending leads count',
            error: error.message
        });
    }
};

module.exports = {
    syncGoogleSheet,
    getAllLeads,
    manualSync,
    getManagersForLocation,
    forwardLeadToManagers,
    getLeadsForManager,
    updateLeadContactStatus,
    getLeadsForAdmin,
    updateLeadAdminStatus,
    getLeadAnalytics,
    getManagersByLocation,
    addLeadRemark,
    receiveWebhookLead,
    getPendingLeadsCountAdmin,
    getPendingLeadsCountManager
};
