const { syncAndQueueLeads } = require("../cron/syncAndQueue");
const leadQueue = require("../queue/leadQueue");
const Lead = require("../models/Lead");
const Manager = require("../models/Manager");
const { retrySendingLead } = require("../services/leadRetry");
const logger = require("../utils/logger");

/**
 * Manual API trigger:
 * Fetch Google Sheet → Queue leads for processing
 */
const syncLeads = async (req, res) => {
    try {
        logger.info("Manual sync triggered via API");
        const result = await syncAndQueueLeads();

        return res.json({
            success: true,
            message: "Leads synced and queued for processing",
            data: result,
        });
    } catch (error) {
        logger.error("Lead sync error:", error.message, error);

        return res.status(500).json({
            success: false,
            message: "Failed to sync leads",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

/**
 * Get queue status and statistics
 */
const getQueueStatus = async (req, res) => {
    try {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            leadQueue.getWaitingCount(),
            leadQueue.getActiveCount(),
            leadQueue.getCompletedCount(),
            leadQueue.getFailedCount(),
            leadQueue.getDelayedCount(),
        ]);

        return res.json({
            success: true,
            data: {
                waiting,
                active,
                completed,
                failed,
                delayed,
                total: waiting + active + completed + failed + delayed,
            },
        });
    } catch (error) {
        logger.error("Get queue status error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to get queue status",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

/**
 * Get recent queue jobs
 */
const getQueueJobs = async (req, res) => {
    try {
        const { status = "all", limit = 50 } = req.query;

        let jobs = [];
        if (status === "waiting") {
            jobs = await leadQueue.getWaiting(0, parseInt(limit));
        } else if (status === "active") {
            jobs = await leadQueue.getActive(0, parseInt(limit));
        } else if (status === "completed") {
            jobs = await leadQueue.getCompleted(0, parseInt(limit));
        } else if (status === "failed") {
            jobs = await leadQueue.getFailed(0, parseInt(limit));
        } else {
            // Get all types
            const [waiting, active, completed, failed] = await Promise.all([
                leadQueue.getWaiting(0, parseInt(limit)),
                leadQueue.getActive(0, parseInt(limit)),
                leadQueue.getCompleted(0, parseInt(limit)),
                leadQueue.getFailed(0, parseInt(limit)),
            ]);
            jobs = [...waiting, ...active, ...completed, ...failed].slice(0, parseInt(limit));
        }

        const jobsData = jobs.map((job) => ({
            id: job.id,
            name: job.name,
            data: job.data,
            status: job.opts?.delay ? "delayed" : job.processedOn ? "completed" : job.failedReason ? "failed" : "active",
            progress: job.progress(),
            attemptsMade: job.attemptsMade,
            failedReason: job.failedReason,
            processedOn: job.processedOn,
            finishedOn: job.finishedOn,
        }));

        return res.json({
            success: true,
            count: jobsData.length,
            data: jobsData,
        });
    } catch (error) {
        logger.error("Get queue jobs error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to get queue jobs",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

/**
 * Get all leads with optional filters
 */
const getLeads = async (req, res) => {
    try {
        const { sent, location, limit = 100, skip = 0 } = req.query;

        const query = {};
        if (sent !== undefined) {
            query.sent = sent === "true";
        }
        if (location) {
            query.location = location.toLowerCase().trim();
        }

        const leads = await Lead.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Lead.countDocuments(query);

        return res.json({
            success: true,
            count: leads.length,
            total,
            data: leads,
        });
    } catch (error) {
        logger.error("Get leads error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch leads",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

/**
 * Get lead statistics
 */
const getLeadStats = async (req, res) => {
    try {
        const total = await Lead.countDocuments();
        const sent = await Lead.countDocuments({ sent: true });
        const unsent = await Lead.countDocuments({ sent: false });
        const totalWhatsAppSent = await Lead.aggregate([
            { $group: { _id: null, total: { $sum: "$sent_to_count" } } },
        ]);

        return res.json({
            success: true,
            data: {
                total_leads: total,
                sent_leads: sent,
                unsent_leads: unsent,
                total_whatsapp_messages_sent: totalWhatsAppSent[0]?.total || 0,
            },
        });
    } catch (error) {
        logger.error("Get lead stats error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch statistics",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

/**
 * Get leads with delivery details (kitne managers ko send hua)
 * Shows all leads with information about which managers received them
 */
const getLeadsDelivery = async (req, res) => {
    try {
        const { location, sent, limit = 100, skip = 0 } = req.query;

        const query = {};
        if (location) {
            query.location = location.toLowerCase().trim();
        }
        if (sent !== undefined) {
            query.sent = sent === "true";
        }

        const leads = await Lead.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        // Get all managers grouped by location for efficient lookup
        const allManagers = await Manager.find();
        const managersByLocation = {};
        allManagers.forEach(manager => {
            if (!managersByLocation[manager.location]) {
                managersByLocation[manager.location] = [];
            }
            managersByLocation[manager.location].push(manager);
        });

        // Enrich leads with manager details
        const leadsWithDelivery = leads.map(lead => {
            const managersForLocation = managersByLocation[lead.location] || [];
            const totalManagersForLocation = managersForLocation.length;

            return {
                _id: lead._id,
                customer_name: lead.customer_name,
                customer_phone: lead.customer_phone,
                location: lead.location,
                sent: lead.sent,
                sent_to_count: lead.sent_to_count,
                total_managers_for_location: totalManagersForLocation,
                failed_sends_count: lead.failed_sends?.length || 0,
                sent_at: lead.sent_at,
                createdAt: lead.createdAt,
                updatedAt: lead.updatedAt,
                delivery_status: lead.sent 
                    ? (lead.sent_to_count === totalManagersForLocation ? "complete" : "partial")
                    : "pending",
                managers: managersForLocation.map(m => {
                    // Check if this manager's number is in failed_sends
                    const isFailed = lead.failed_sends?.includes(m.whatsapp_number) || false;
                    // Received = not in failed list AND some messages were sent
                    // Note: If sent_to_count < total managers, some failed but we don't know which ones individually
                    // So we can only say "not failed" if sent_to_count matches expected count
                    const received = !isFailed && lead.sent_to_count > 0 && 
                                    (lead.failed_sends?.length || 0) + lead.sent_to_count === totalManagersForLocation;
                    
                    return {
                        _id: m._id,
                        whatsapp_number: m.whatsapp_number,
                        received: received,
                    };
                }),
            };
        });

        const total = await Lead.countDocuments(query);

        return res.json({
            success: true,
            count: leadsWithDelivery.length,
            total,
            data: leadsWithDelivery,
        });
    } catch (error) {
        logger.error("Get leads delivery error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch lead delivery details",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

/**
 * Get specific lead delivery details
 */
const getLeadDeliveryById = async (req, res) => {
    try {
        const { id } = req.params;

        const lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }

        // Get all managers for this location
        const managers = await Manager.find({ location: lead.location });
        const totalManagersForLocation = managers.length;

        const deliveryDetails = {
            _id: lead._id,
            customer_name: lead.customer_name,
            customer_phone: lead.customer_phone,
            location: lead.location,
            sent: lead.sent,
            sent_to_count: lead.sent_to_count,
            total_managers_for_location: totalManagersForLocation,
            failed_sends: lead.failed_sends || [],
            failed_sends_count: lead.failed_sends?.length || 0,
            sent_at: lead.sent_at,
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
            delivery_status: lead.sent 
                ? (lead.sent_to_count === totalManagersForLocation ? "complete" : "partial")
                : "pending",
            managers: managers.map(m => {
                const isFailed = lead.failed_sends?.includes(m.whatsapp_number) || false;
                const received = !isFailed && lead.sent_to_count > 0 && 
                                (lead.failed_sends?.length || 0) + lead.sent_to_count === totalManagersForLocation;
                
                let status = "pending";
                if (lead.sent_to_count > 0) {
                    status = isFailed ? "failed" : (received ? "sent" : "unknown");
                }
                
                return {
                    _id: m._id,
                    whatsapp_number: m.whatsapp_number,
                    location: m.location,
                    received: received,
                    status: status,
                };
            }),
        };

        return res.json({
            success: true,
            data: deliveryDetails,
        });
    } catch (error) {
        logger.error("Get lead delivery by ID error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch lead delivery details",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

/**
 * Get failed/unsent leads that need retry
 */
const getFailedLeads = async (req, res) => {
    try {
        const { location, limit = 100, skip = 0 } = req.query;

        const query = {
            sent: false, // Only unsent leads
        };

        if (location) {
            query.location = location.toLowerCase().trim();
        }

        const leads = await Lead.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        // Get manager counts for each location
        const allManagers = await Manager.find();
        const managersByLocation = {};
        allManagers.forEach(manager => {
            if (!managersByLocation[manager.location]) {
                managersByLocation[manager.location] = [];
            }
            managersByLocation[manager.location].push(manager);
        });

        // Enrich leads with retry information
        const failedLeads = leads.map(lead => {
            const managersForLocation = managersByLocation[lead.location] || [];
            const totalManagers = managersForLocation.length;
            const failedCount = lead.failed_sends?.length || 0;

            return {
                _id: lead._id,
                customer_name: lead.customer_name,
                customer_phone: lead.customer_phone,
                location: lead.location,
                sent_to_count: lead.sent_to_count || 0,
                total_managers_for_location: totalManagers,
                failed_sends_count: failedCount,
                failed_sends: lead.failed_sends || [],
                createdAt: lead.createdAt,
                updatedAt: lead.updatedAt,
                retry_reason: totalManagers === 0 
                    ? "no_managers" 
                    : lead.sent_to_count === 0 
                        ? "not_sent" 
                        : "partial_failure",
            };
        });

        const total = await Lead.countDocuments(query);

        return res.json({
            success: true,
            count: failedLeads.length,
            total,
            data: failedLeads,
        });
    } catch (error) {
        logger.error("Get failed leads error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch failed leads",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

/**
 * Retry sending a specific lead
 */
const retryLead = async (req, res) => {
    try {
        const { id } = req.params;
        const { retryFailedOnly = true } = req.body; // Default to only retry failed managers

        const result = await retrySendingLead(id, retryFailedOnly);

        return res.json({
            success: true,
            message: "Lead retry completed",
            data: result,
        });
    } catch (error) {
        logger.error("Retry lead error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retry lead",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

/**
 * Bulk retry multiple leads
 */
const bulkRetryLeads = async (req, res) => {
    try {
        const { leadIds, retryFailedOnly = true } = req.body;

        if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "leadIds array is required",
            });
        }

        const results = [];
        const errors = [];

        for (const leadId of leadIds) {
            try {
                const result = await retrySendingLead(leadId, retryFailedOnly);
                results.push({
                    leadId,
                    ...result,
                });
            } catch (error) {
                errors.push({
                    leadId,
                    error: error.message,
                });
            }
        }

        return res.json({
            success: true,
            message: `Bulk retry completed: ${results.length} successful, ${errors.length} failed`,
            data: {
                total: leadIds.length,
                successful: results.length,
                failed: errors.length,
                results,
                errors,
            },
        });
    } catch (error) {
        logger.error("Bulk retry leads error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to bulk retry leads",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

module.exports = {
    syncLeads,
    getLeads,
    getLeadStats,
    getLeadsDelivery,
    getLeadDeliveryById,
    getQueueStatus,
    getQueueJobs,
    getFailedLeads,
    retryLead,
    bulkRetryLeads,
};
