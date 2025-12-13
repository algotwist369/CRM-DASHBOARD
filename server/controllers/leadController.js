const DailyClickCount = require("../models/DailyClickCount");
const IpPageJourney = require("../models/IpPageJourney");
const Business = require("../models/Business");
const mongoose = require("mongoose");

// Helper to get start of day in local time or UTC (using simplified YYYY-MM-DD string as per model)
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

// Helper to extract robust IP
const getClientIp = (req) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
    if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1'; // Normalize localhost
    if (ip && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', ''); // Normalize IPv4-mapped
    return ip;
};

exports.trackLead = async (req, res) => {
    try {
        const { businessId, leadType, page } = req.body;

        // Extract IP address (handle proxies if deployed behind Nginx/Cloudflare)
        const ipAddress = getClientIp(req);

        // Validation
        if (!businessId || !leadType) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const date = getTodayDateString();
        const updateFields = {};

        // 1. Update Daily Click Count
        if (leadType === 'call') updateFields.callClicks = 1;
        else if (leadType === 'whatsapp') updateFields.whatsappClicks = 1;
        else if (leadType === 'booking') updateFields.bookingClicks = 1;

        const dailyClickPromise = DailyClickCount.findOneAndUpdate(
            { businessId, date },
            { $inc: updateFields },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 2. Update IP Page Journey
        // Only keep last 10 pages to avoid unbounded array growth
        const journeyUpdate = {
            $push: {
                pagesVisited: {
                    $each: [{ page, timestamp: new Date() }],
                    $slice: -10 // Keep only last 10
                }
            },
            $set: {
                lastPageVisited: page,
                lastVisitedAt: new Date(),
                ipAddress: ipAddress // Refresh IP in case it changed slightly but same session
            }
        };

        // Only increment totalClicks for interaction events, not passive page views
        if (['call', 'whatsapp', 'booking'].includes(leadType)) {
            journeyUpdate.$inc = { totalClicks: 1 };
        }

        const ipJourneyPromise = IpPageJourney.findOneAndUpdate(
            { businessId, ipAddress },
            journeyUpdate,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Execute both concurrently
        await Promise.all([dailyClickPromise, ipJourneyPromise]);

        res.status(200).json({ success: true, message: "Tracked successfully" });

    } catch (error) {
        console.error("Tracking Error:", error);
        // Fail silently to client, but log error
        res.status(500).json({ success: false, message: "Tracking failed silently" });
    }
};

exports.getAnalyticsSummary = async (req, res) => {
    try {
        const { date, businessId } = req.query;
        const queryDate = date || getTodayDateString();

        const matchStage = { date: queryDate };
        if (businessId) {
            matchStage.businessId = new mongoose.Types.ObjectId(businessId);
        }

        // Aggregate total clicks for the date (and optional business)
        const todayStats = await DailyClickCount.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalCallClicks: { $sum: "$callClicks" },
                    totalWhatsappClicks: { $sum: "$whatsappClicks" },
                    totalBookingClicks: { $sum: "$bookingClicks" },
                    totalClicks: {
                        $sum: { $add: ["$callClicks", "$whatsappClicks", "$bookingClicks"] }
                    }
                }
            }
        ]);

        const stats = todayStats[0] || {
            totalCallClicks: 0,
            totalWhatsappClicks: 0,
            totalBookingClicks: 0,
            totalClicks: 0
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("Analytics Summary Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getBusinessBreakdown = async (req, res) => {
    try {
        const { date, businessId, sortBy = 'totalClicks', order = 'desc', limit = 10, page = 1 } = req.query;
        const queryDate = date || getTodayDateString();

        const limitNum = parseInt(limit);
        const skip = (parseInt(page) - 1) * limitNum;
        const sortOrder = order === 'desc' ? -1 : 1;

        const matchStage = { date: queryDate };
        if (businessId) {
            matchStage.businessId = new mongoose.Types.ObjectId(businessId);
        }

        const breakdown = await DailyClickCount.aggregate([
            { $match: matchStage },
            // Join with Business collection to get name
            {
                $lookup: {
                    from: "businesses",
                    localField: "businessId",
                    foreignField: "_id",
                    as: "business"
                }
            },
            { $unwind: "$business" },
            {
                $project: {
                    businessName: "$business.name",
                    branch: "$business.branch",
                    callClicks: 1,
                    whatsappClicks: 1,
                    bookingClicks: 1,
                    totalClicks: { $add: ["$callClicks", "$whatsappClicks", "$bookingClicks"] }
                }
            },
            { $sort: { [sortBy]: sortOrder } },
            { $skip: skip },
            { $limit: limitNum }
        ]);

        // Get total count for pagination
        const totalCount = await DailyClickCount.countDocuments(matchStage);

        res.status(200).json({
            success: true,
            data: breakdown,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                pages: Math.ceil(totalCount / limitNum)
            }
        });
    } catch (error) {
        console.error("Business Breakdown Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getIpJourneys = async (req, res) => {
    try {
        const { date, businessId, page = 1, limit = 20 } = req.query;
        
        const filter = {};
        if (businessId) {
            filter.businessId = businessId;
        }

        // Filter by date (using start/end of day logic for 'lastVisitedAt')
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            filter.lastVisitedAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const journeys = await IpPageJourney.find(filter)
            .populate('businessId', 'name branch') // Get business details
            .sort({ lastVisitedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await IpPageJourney.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: journeys,
            pagination: {
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("IP Journey Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
