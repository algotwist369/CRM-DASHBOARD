// reportController.js - Reports, analytics, exports
const DailyBusiness = require("../models/DailyBusiness");
const Transaction = require("../models/Transaction");
const Customer = require("../models/Customer");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const { setCache, getCache } = require("../utils/cache");
const { exportToCSV, exportToPDF } = require("../utils/reportExport");

// ================== Get Manager Reports ==================
const getManagerReports = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const cacheKey = `reports:manager:${managerId}:page:${page}:limit:${limit}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) return res.json({ success: true, source: "cache", ...cachedData });

        const reports = await DailyBusiness.find({ manager: managerId })
            .populate("transactions")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ date: -1 });

        const total = await DailyBusiness.countDocuments({ manager: managerId });

        const response = {
            success: true,
            data: reports,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        };

        await setCache(cacheKey, response, 120); // cache 2 min

        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Admin Reports (All Businesses) ==================
const getAdminReports = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const cacheKey = `reports:admin:${adminId}:page:${page}:limit:${limit}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) return res.json({ success: true, source: "cache", ...cachedData });

        // Get admin's businesses
        const businesses = await Business.find({ admin: adminId }).select('_id');
        const businessIds = businesses.map(b => b._id);

        const reports = await DailyBusiness.find({ business: { $in: businessIds } })
            .populate("manager", "username")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ date: -1 });

        const total = await DailyBusiness.countDocuments({ business: { $in: businessIds } });

        const response = {
            success: true,
            data: reports,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        };

        await setCache(cacheKey, response, 120);

        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Revenue Trends ==================
const revenueTrends = async (req, res, next) => {
    try {
        const { role, id } = req.user;
        let match = {};

        if (role === 'admin') {
            const businesses = await Business.find({ admin: id }).select('_id');
            match = { business: { $in: businesses.map(b => b._id) } };
        } else {
            // Manager
            match = { manager: id };
        }

        const data = await DailyBusiness.aggregate([
            { $match: match },
            { $group: { _id: "$date", totalIncome: { $sum: "$totalIncome" } } },
            { $sort: { _id: 1 } },
        ]);

        return res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// ================== Staff Performance ==================
const staffPerformance = async (req, res, next) => {
    try {
        const managerId = req.user.id;

        const staffStats = await Transaction.aggregate([
            { $match: { manager: managerId } },
            { $group: { _id: "$staff", totalRevenue: { $sum: "$amount" }, customers: { $sum: 1 } } },
            { $sort: { totalRevenue: -1 } },
        ]);

        return res.json({ success: true, data: staffStats });
    } catch (err) {
        next(err);
    }
};

// ================== Export Reports ==================
const exportReports = async (req, res, next) => {
    try {
        const { format = "csv", scope = "manager" } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log('Export request:', { format, scope, userId, userRole });

        let reports;

        if (userRole === "admin") {
            if (scope === "admin") {
                // Admin exporting all their businesses
                const businesses = await Business.find({ admin: userId }).select('_id');
                const businessIds = businesses.map(b => b._id);
                reports = await DailyBusiness.find({ business: { $in: businessIds } })
                    .populate("manager", "username name")
                    .populate("business", "name")
                    .lean();
            } else {
                // Admin exporting specific business or all (default to all THEIR businesses if no filter)
                // For now, if "scope" is not 'admin' (maybe 'business'?), we should check if businessId is passed?
                // But looking at existing logic, it was falling back to 'all'. 
                // We MUST restartrict 'all' to 'all admin's businesses'.
                const businesses = await Business.find({ admin: userId }).select('_id');
                const businessIds = businesses.map(b => b._id);

                reports = await DailyBusiness.find({ business: { $in: businessIds } })
                    .populate("manager", "username name")
                    .populate("business", "name")
                    .lean();
            }
        } else if (userRole === "manager") {
            // Manager exporting their business only
            const manager = await Manager.findById(userId);
            if (!manager || !manager.business) {
                return res.status(404).json({ success: false, message: "Manager business not found" });
            }
            reports = await DailyBusiness.find({ business: manager.business })
                .populate("manager", "username name")
                .populate("business", "name")
                .lean();
        } else {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        console.log('Reports found:', reports.length);

        if (!reports.length) {
            return res.status(404).json({ success: false, message: "No reports found" });
        }

        // Add calculated netProfit field
        reports = reports.map(r => ({
            ...r,
            netProfit: (r.totalIncome || 0) - (r.totalExpenses || 0)
        }));

        if (format === "csv") {
            const csvFile = await exportToCSV(reports);
            res.header("Content-Type", "text/csv");
            res.attachment("reports.csv");
            return res.send(csvFile);
        }

        if (format === "pdf") {
            const pdfBuffer = await exportToPDF(reports);
            res.header("Content-Type", "application/pdf");
            res.attachment("reports.pdf");
            return res.send(pdfBuffer);
        }

        return res.status(400).json({ success: false, message: "Invalid format" });
    } catch (err) {
        console.error('Export error:', err);
        next(err);
    }
};


// ================== Get Reports (Unified) ==================
const getReports = async (req, res, next) => {
    try {
        if (req.user.role === "admin") {
            return getAdminReports(req, res, next);
        } else {
            return getManagerReports(req, res, next);
        }
    } catch (err) {
        next(err);
    }
};

// ================== Get Analytics (ENHANCED) ==================
const getAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { startDate, endDate, businessId } = req.query;

        // Build date filter
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Build business filter based on role
        let businessFilter = {};
        let businessOnlyFilter = {}; // For counts without date filter

        if (userRole === 'admin') {
            if (businessId) {
                // Admin viewing specific business
                businessFilter.business = businessId;
                businessOnlyFilter.business = businessId;
            } else {
                // Admin viewing all their businesses
                const businesses = await Business.find({ admin: userId }).select('_id');
                const businessIds = businesses.map(b => b._id);

                // CRITICAL FIX: Always apply filter, even if empty. An admin with no businesses should see nothing.
                businessFilter.business = { $in: businessIds };
                businessOnlyFilter.business = { $in: businessIds };
            }
        } else if (userRole === 'manager') {
            // Manager viewing their business only
            const manager = await Manager.findById(userId);
            if (manager && manager.business) {
                businessFilter.business = manager.business;
                businessOnlyFilter.business = manager.business;
            }
        }

        // Apply date filter ONLY to businessFilter (for revenue)
        if (Object.keys(dateFilter).length > 0) {
            businessFilter.createdAt = dateFilter;
        }

        // Cache key
        const cacheKey = `analytics:${userRole}:${userId}:${startDate}:${endDate}:${businessId}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        //===== SUMMARY METRICS =====
        // Use businessFilter (WITH date filter) for counts
        const [
            totalCustomers,
            totalAppointments,
            completedAppointments,
            totalInvoices
        ] = await Promise.all([
            Customer.countDocuments(businessFilter),
            Appointment.countDocuments(businessFilter),
            Appointment.countDocuments({ ...businessFilter, status: 'completed' }),
            Invoice.countDocuments(businessFilter)
        ]);

        // Revenue aggregation from DailyBusiness with date filter
        let revenueMatchFilter = {};

        // Add business filter
        if (businessFilter.business) {
            if (businessFilter.business.$in) {
                revenueMatchFilter.business = { $in: businessFilter.business.$in };
            } else {
                revenueMatchFilter.business = businessFilter.business;
            }
        }

        // Add date filter to revenue query
        if (Object.keys(dateFilter).length > 0) {
            revenueMatchFilter.date = {
                $gte: dateFilter.$gte,
                $lte: dateFilter.$lte
            };
        }

        const revenueAgg = await DailyBusiness.aggregate([
            { $match: revenueMatchFilter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalIncome" },
                    totalExpenses: { $sum: "$totalExpenses" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const summary = {
            totalRevenue: revenueAgg[0]?.totalRevenue || 0,
            totalExpenses: revenueAgg[0]?.totalExpenses || 0,
            netProfit: (revenueAgg[0]?.totalRevenue || 0) - (revenueAgg[0]?.totalExpenses || 0),
            totalCustomers,
            totalAppointments,
            completedAppointments,
            totalInvoices,
            appointmentCompletionRate: totalAppointments > 0
                ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
                : 0,
            avgOrderValue: totalInvoices > 0
                ? ((revenueAgg[0]?.totalRevenue || 0) / totalInvoices).toFixed(2)
                : 0
        };

        // ===== REVENUE TRENDS =====
        const revenueMatch = businessFilter.business
            ? { business: businessFilter.business }
            : businessFilter.business?.$in
                ? { business: { $in: businessFilter.business.$in } }
                : {};

        const revenueTrends = await DailyBusiness.aggregate([
            { $match: revenueMatch },
            {
                $group: {
                    _id: "$date",
                    totalIncome: { $sum: "$totalIncome" },
                    totalExpenses: { $sum: "$totalExpenses" }
                }
            },
            {
                $project: {
                    _id: 1,
                    totalIncome: 1,
                    totalExpenses: 1,
                    netProfit: { $subtract: ["$totalIncome", "$totalExpenses"] }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 } // Last 30 data points
        ]);

        // ===== CUSTOMER ANALYTICS =====
        // Use businessFilter WITH date filter
        const customerMatch = businessFilter.business
            ? { business: businessFilter.business }
            : businessFilter.business?.$in
                ? { business: { $in: businessFilter.business.$in } }
                : {};

        // Add createdAt date filter for customers
        if (Object.keys(dateFilter).length > 0) {
            customerMatch.createdAt = {
                $gte: dateFilter.$gte,
                $lte: dateFilter.$lte
            };
        }

        const customerStats = await Customer.aggregate([
            { $match: customerMatch },
            {
                $facet: {
                    byTier: [
                        { $group: { _id: "$membershipTier", count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ],
                    topSpenders: [
                        { $sort: { totalSpent: -1 } },
                        { $limit: 50 },
                        { $project: { fullName: 1, email: 1, totalSpent: 1, visits: 1 } }
                    ],
                    recentSignups: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 50 },
                        { $project: { fullName: 1, email: 1, createdAt: 1 } }
                    ]
                }
            }
        ]);

        // ===== APPOINTMENT ANALYTICS =====
        // Use businessFilter WITH date filter for appointments
        const appointmentMatch = businessFilter.business
            ? { business: businessFilter.business }
            : businessFilter.business?.$in
                ? { business: { $in: businessFilter.business.$in } }
                : {};

        // Add createdAt date filter for appointments
        if (Object.keys(dateFilter).length > 0) {
            appointmentMatch.createdAt = {
                $gte: dateFilter.$gte,
                $lte: dateFilter.$lte
            };
        }

        const appointmentStats = await Appointment.aggregate([
            { $match: appointmentMatch },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // ===== STAFF PERFORMANCE (Manager only) =====
        let staffPerformance = [];
        if (userRole === 'manager') {
            staffPerformance = await Transaction.aggregate([
                { $match: { manager: userId } },
                {
                    $group: {
                        _id: "$staff",
                        totalRevenue: { $sum: "$amount" },
                        totalTransactions: { $sum: 1 }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 10 }
            ]);
        }

        // Build response
        const response = {
            success: true,
            data: {
                summary,
                revenue: revenueTrends,
                customers: {
                    byTier: customerStats[0]?.byTier || [],
                    topSpenders: customerStats[0]?.topSpenders || [],
                    recentSignups: customerStats[0]?.recentSignups || []
                },
                appointments: {
                    byStatus: appointmentStats,
                    total: totalAppointments,
                    completed: completedAppointments,
                    completionRate: summary.appointmentCompletionRate
                },
                staff: staffPerformance
            }
        };

        await setCache(cacheKey, response, 180); // Cache for 3 minutes
        return res.json(response);
    } catch (err) {
        console.error('Analytics Error:', err);
        next(err);
    }
};

// ================== Get Summary (NEW) ==================
const getSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId } = req.query;

        // Build business filter
        let businessFilter = {};
        if (userRole === 'admin') {
            if (businessId) {
                businessFilter.business = businessId;
            } else {
                const businesses = await Business.find({ admin: userId }).select('_id');
                businessFilter.business = { $in: businesses.map(b => b._id) };
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager?.business) {
                businessFilter.business = manager.business;
            }
        }

        const cacheKey = `summary:${userRole}:${userId}:${businessId}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        // Quick parallel queries
        const [revenueData, customerCount, appointmentCount] = await Promise.all([
            DailyBusiness.aggregate([
                { $match: businessFilter.business ? { business: businessFilter.business } : {} },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalIncome" },
                        totalExpenses: { $sum: "$totalExpenses" }
                    }
                }
            ]),
            Customer.countDocuments(businessFilter),
            Appointment.countDocuments(businessFilter)
        ]);

        const response = {
            success: true,
            data: {
                revenue: revenueData[0]?.totalRevenue || 0,
                expenses: revenueData[0]?.totalExpenses || 0,
                profit: (revenueData[0]?.totalRevenue || 0) - (revenueData[0]?.totalExpenses || 0),
                customers: customerCount,
                appointments: appointmentCount
            }
        };

        await setCache(cacheKey, response, 300); // Cache for 5 minutes
        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Trends (NEW) ==================
const getTrends = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { type = 'revenue', period = 'daily', businessId, limit = 30 } = req.query;

        // Build business filter
        let businessFilter = {};
        if (userRole === 'admin') {
            if (businessId) {
                businessFilter.business = businessId;
            } else {
                const businesses = await Business.find({ admin: userId }).select('_id');
                businessFilter.business = { $in: businesses.map(b => b._id) };
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager?.business) {
                businessFilter.business = manager.business;
            }
        }

        const cacheKey = `trends:${type}:${period}:${userRole}:${userId}:${businessId}:${limit}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        let trends = [];

        if (type === 'revenue') {
            trends = await DailyBusiness.aggregate([
                { $match: businessFilter.business ? { business: businessFilter.business } : {} },
                {
                    $group: {
                        _id: "$date",
                        value: { $sum: "$totalIncome" },
                        expenses: { $sum: "$totalExpenses" }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: parseInt(limit) },
                {
                    $project: {
                        date: "$_id",
                        value: 1,
                        expenses: 1,
                        profit: { $subtract: ["$value", "$expenses"] },
                        _id: 0
                    }
                },
                { $sort: { date: 1 } }
            ]);
        } else if (type === 'customers') {
            trends = await Customer.aggregate([
                { $match: businessFilter },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        value: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: parseInt(limit) },
                { $project: { date: "$_id", value: 1, _id: 0 } },
                { $sort: { date: 1 } }
            ]);
        } else if (type === 'appointments') {
            trends = await Appointment.aggregate([
                { $match: businessFilter },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        value: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: parseInt(limit) },
                { $project: { date: "$_id", value: 1, _id: 0 } },
                { $sort: { date: 1 } }
            ]);
        }

        const response = {
            success: true,
            data: trends
        };

        await setCache(cacheKey, response, 180);
        return res.json(response);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getReports,
    getManagerReports,
    getAdminReports,
    getAnalytics,
    revenueTrends,
    staffPerformance,
    exportReports,
    getSummary,
    getTrends
};