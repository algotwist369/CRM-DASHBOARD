const Lead = require("../models/Lead");
const Manager = require("../models/Manager");
const logger = require("../utils/logger");

/**
 * Get comprehensive analytics for leads and managers
 * Filters by date range (today, yesterday, tomorrow, or custom dates)
 */
const getAnalytics = async (req, res) => {
    try {
        const { 
            startDate, 
            endDate, 
            period = "custom", // today, yesterday, tomorrow, custom, all
            location 
        } = req.query;

        // Build date query based on period
        let dateQuery = {};
        let dateRange = {};

        if (period === "today") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateQuery = {
                sent_at: {
                    $gte: today,
                    $lt: tomorrow,
                },
            };
            dateRange = {
                start: today,
                end: tomorrow,
                period: "today",
            };
        } else if (period === "yesterday") {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const today = new Date(yesterday);
            today.setDate(today.getDate() + 1);
            dateQuery = {
                sent_at: {
                    $gte: yesterday,
                    $lt: today,
                },
            };
            dateRange = {
                start: yesterday,
                end: today,
                period: "yesterday",
            };
        } else if (period === "tomorrow") {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);
            dateQuery = {
                sent_at: {
                    $gte: tomorrow,
                    $lt: dayAfter,
                },
            };
            dateRange = {
                start: tomorrow,
                end: dayAfter,
                period: "tomorrow",
            };
        } else if (period === "custom" && startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateQuery = {
                sent_at: {
                    $gte: start,
                    $lte: end,
                },
            };
            dateRange = {
                start: start,
                end: end,
                period: "custom",
            };
        } else if (period === "all") {
            dateQuery = { sent_at: { $exists: true } };
            dateRange = {
                period: "all",
            };
        } else {
            // Default: today if no period specified
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateQuery = {
                sent_at: {
                    $gte: today,
                    $lt: tomorrow,
                },
            };
            dateRange = {
                start: today,
                end: tomorrow,
                period: "today",
            };
        }

        // Build base query
        const baseQuery = {
            sent: true, // Only sent leads
            ...dateQuery,
        };

        if (location) {
            baseQuery.location = location.toLowerCase().trim();
        }

        // Get all sent leads in date range
        const leads = await Lead.find(baseQuery);

        // Get all managers with their locations
        const allManagers = await Manager.find();
        const managersByLocation = {};
        allManagers.forEach(manager => {
            if (!managersByLocation[manager.location]) {
                managersByLocation[manager.location] = [];
            }
            managersByLocation[manager.location].push(manager);
        });

        // Aggregate statistics by location
        const locationStats = {};
        let totalLeads = 0;
        let totalWhatsAppSent = 0;
        let totalManagers = 0;

        leads.forEach(lead => {
            const loc = lead.location;
            
            if (!locationStats[loc]) {
                locationStats[loc] = {
                    location: loc,
                    total_leads: 0,
                    total_whatsapp_sent: 0,
                    total_managers: managersByLocation[loc]?.length || 0,
                    managers_received: new Set(),
                };
            }

            locationStats[loc].total_leads++;
            locationStats[loc].total_whatsapp_sent += lead.sent_to_count || 0;
            
            // Track which managers received leads
            const managersForLocation = managersByLocation[loc] || [];
            managersForLocation.forEach(m => {
                // If not in failed_sends, consider it received
                if (!lead.failed_sends || !lead.failed_sends.includes(m.whatsapp_number)) {
                    if (lead.sent_to_count > 0) {
                        locationStats[loc].managers_received.add(m.whatsapp_number);
                    }
                }
            });

            totalLeads++;
            totalWhatsAppSent += lead.sent_to_count || 0;
        });

        // Convert Set to count and prepare final stats
        const locationAnalytics = Object.values(locationStats).map(stat => ({
            location: stat.location,
            total_leads_sent: stat.total_leads,
            total_whatsapp_messages_sent: stat.total_whatsapp_sent,
            total_managers_in_location: stat.total_managers,
            managers_who_received_leads: stat.managers_received.size,
            average_leads_per_manager: stat.total_managers > 0 
                ? (stat.total_whatsapp_sent / stat.total_managers).toFixed(2)
                : 0,
            average_messages_per_lead: stat.total_leads > 0
                ? (stat.total_whatsapp_sent / stat.total_leads).toFixed(2)
                : 0,
        }));

        // Get additional statistics
        const unsentLeadsQuery = { sent: false };
        if (location) {
            unsentLeadsQuery.location = location.toLowerCase().trim();
        }
        const unsentLeads = await Lead.countDocuments(unsentLeadsQuery);

        const allLeadsQuery = location ? { location: location.toLowerCase().trim() } : {};
        const allLeadsCount = await Lead.countDocuments(allLeadsQuery);

        // Daily breakdown (if custom range)
        let dailyBreakdown = [];
        if (period === "custom" && dateRange.start && dateRange.end) {
            const days = [];
            const current = new Date(dateRange.start);
            while (current <= dateRange.end) {
                const dayStart = new Date(current);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(current);
                dayEnd.setHours(23, 59, 59, 999);

                const dayLeadsQuery = {
                    sent: true,
                    sent_at: { $gte: dayStart, $lte: dayEnd },
                };
                if (location) {
                    dayLeadsQuery.location = location.toLowerCase().trim();
                }
                const dayLeads = await Lead.countDocuments(dayLeadsQuery);

                const matchQuery = {
                    sent: true,
                    sent_at: { $gte: dayStart, $lte: dayEnd },
                };
                if (location) {
                    matchQuery.location = location.toLowerCase().trim();
                }

                const dayWhatsApp = await Lead.aggregate([
                    {
                        $match: matchQuery,
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$sent_to_count" },
                        },
                    },
                ]);

                days.push({
                    date: current.toISOString().split('T')[0],
                    leads_sent: dayLeads,
                    whatsapp_sent: dayWhatsApp[0]?.total || 0,
                });

                current.setDate(current.getDate() + 1);
            }
            dailyBreakdown = days;
        }

        const analytics = {
            date_range: dateRange,
            summary: {
                total_leads_sent: totalLeads,
                total_whatsapp_messages_sent: totalWhatsAppSent,
                total_unsent_leads: unsentLeads,
                total_leads_in_system: allLeadsCount,
                unique_locations: Object.keys(locationStats).length,
                average_messages_per_lead: totalLeads > 0 
                    ? (totalWhatsAppSent / totalLeads).toFixed(2)
                    : 0,
            },
            by_location: locationAnalytics,
            ...(dailyBreakdown.length > 0 && { daily_breakdown: dailyBreakdown }),
        };

        return res.json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        logger.error("Get analytics error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch analytics",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

module.exports = {
    getAnalytics,
};

