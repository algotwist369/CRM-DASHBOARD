// reportController.js - Reports, analytics, exports
const DailyBusiness = require("../models/DailyBusiness");
const Transaction = require("../models/Transaction");
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
        const { page = 1, limit = 10 } = req.query;
        const cacheKey = `reports:admin:page:${page}:limit:${limit}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) return res.json({ success: true, source: "cache", ...cachedData });

        const reports = await DailyBusiness.find()
            .populate("manager", "username")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ date: -1 });

        const total = await DailyBusiness.countDocuments();

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
        const managerId = req.user.role === "manager" ? req.user.id : null;
        const match = managerId ? { manager: managerId } : {};

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
        const managerId = req.user.id;

        let reports;
        if (scope === "admin" && req.user.role === "admin") {
            reports = await DailyBusiness.find().populate("manager", "username").lean();
        } else {
            reports = await DailyBusiness.find({ manager: managerId }).populate("transactions").lean();
        }

        if (!reports.length) return res.status(404).json({ success: false, message: "No reports found" });

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

// ================== Get Analytics ==================
const getAnalytics = async (req, res, next) => {
    try {
        const managerId = req.user.role === "manager" ? req.user.id : null;
        const match = managerId ? { manager: managerId } : {};

        // Revenue trends
        const revenueData = await DailyBusiness.aggregate([
            { $match: match },
            { $group: { _id: "$date", totalIncome: { $sum: "$totalIncome" } } },
            { $sort: { _id: 1 } },
        ]);

        // Staff performance (only for managers)
        let staffData = [];
        if (managerId) {
            staffData = await Transaction.aggregate([
                { $match: { manager: managerId } },
                { $group: { _id: "$staff", totalRevenue: { $sum: "$amount" }, customers: { $sum: 1 } } },
                { $sort: { totalRevenue: -1 } },
            ]);
        }
        
        return res.json({
            success: true,
            data: {
                revenue: revenueData,
                staff: staffData
            }
        });
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
};