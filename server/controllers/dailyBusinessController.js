// dailyBusinessController.js - Handles daily business operations

const DailyBusiness = require("../models/DailyBusiness");
const Transaction = require("../models/Transaction");
const Business = require("../models/Business");
const mongoose = require("mongoose");
const { calculateDailyMetrics, generateBusinessAnalytics } = require("../utils/businessUtils");
const { setCache, getCache, deleteCache } = require("../utils/cache");

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
    if (!id || id === 'undefined' || id === 'null') {
        return false;
    }
    return mongoose.Types.ObjectId.isValid(id);
};

// ================== Add Daily Business Record(admin and manager) ==================
const addDailyBusiness = async (req, res, next) => {
    try {
        const { businessId, date, notes, weather, specialEvents } = req.body;
        const userRole = req.user?.role;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required"
            });
        }

        let managerId = req.user.id;
        let resolvedBusinessId = businessId || req.user.businessId;

        if (userRole === "staff") {
            managerId = req.user.managerId;
            resolvedBusinessId = req.user.businessId;

            if (!managerId || !resolvedBusinessId) {
                return res.status(403).json({
                    success: false,
                    message: "Staff account is not linked to a manager or business"
                });
            }
        }

        if (!resolvedBusinessId || !isValidObjectId(resolvedBusinessId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Business ID is required"
            });
        }

        // Check if business exists
        const business = await Business.findById(resolvedBusinessId);
        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        // Check if daily record already exists for this date
        const targetDate = new Date(date);
        const existingRecord = await DailyBusiness.findOne({
            business: resolvedBusinessId,
            date: targetDate
        });

        if (existingRecord) {
            return res.status(400).json({
                success: false,
                message: "Daily business record already exists for this date"
            });
        }

        // Get transactions for this date to calculate metrics
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const transactions = await Transaction.find({
            business: resolvedBusinessId,
            transactionDate: { $gte: startOfDay, $lte: endOfDay }
        }).populate('staff');

        // Calculate metrics from transactions
        const metrics = calculateDailyMetrics(transactions);

        // Normalize special events (accept string, array, etc.)
        const normalizedSpecialEvents = Array.isArray(specialEvents)
            ? specialEvents.map(event => String(event).trim()).filter(Boolean)
            : typeof specialEvents === "string"
                ? specialEvents.split(/[\n,]+/).map(event => event.trim()).filter(Boolean)
                : [];

        // Create daily business record
        const dailyBusiness = await DailyBusiness.create({
            business: resolvedBusinessId,
            manager: managerId,
            date: targetDate,
            businessType: business.type,
            totalCustomers: metrics.totalCustomers,
            totalIncome: metrics.totalRevenue,
            totalExpenses: 0, // Can be updated separately
            netProfit: metrics.totalRevenue,
            services: Object.entries(metrics.serviceBreakdown).map(([serviceType, data]) => ({
                serviceName: serviceType,
                serviceType,
                customerCount: data.count,
                totalRevenue: data.revenue,
                averagePrice: data.count > 0 ? data.revenue / data.count : 0
            })),
            staffPerformance: Object.entries(metrics.staffPerformance).map(([staffId, data]) => ({
                staff: staffId,
                customersServed: data.customersServed,
                revenue: data.revenue,
                commission: data.commission
            })),
            metrics: {
                walkInCustomers: metrics.totalCustomers,
                appointmentCustomers: 0,
                repeatCustomers: 0,
                newCustomers: metrics.totalCustomers,
                averageServiceTime: metrics.averageServiceTime,
                customerSatisfaction: metrics.customerSatisfaction
            },
            notes,
            weather,
            specialEvents: normalizedSpecialEvents,
            createdBy: req.user.id,
            createdByRole: userRole,
            isCompleted: true,
            completedAt: new Date()
        });

        // Invalidate cache
        await deleteCache(`business:${resolvedBusinessId}:daily-business`);
        if (managerId) {
            await deleteCache(`manager:${managerId}:daily-business`);
        }

        return res.status(201).json({
            success: true,
            message: "Daily business record added successfully",
            data: dailyBusiness
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Daily Business Records ==================
const getDailyBusinessRecords = async (req, res, next) => {
    try {
        const { businessId, startDate, endDate, page = 1, limit = 10 } = req.query;
        const userRole = req.user?.role;
        const isStaff = userRole === "staff";
        const managerId = isStaff ? req.user.managerId : req.user.id;

        if (isStaff && (!managerId || !req.user.businessId)) {
            return res.status(403).json({
                success: false,
                message: "Staff account is not linked to a manager or business"
            });
        }

        let resolvedBusinessId = isStaff ? req.user.businessId : (businessId || req.user.businessId);

        if (!resolvedBusinessId && userRole === "manager") {
            const manager = await require("../models/Manager").findById(managerId).populate('business');
            if (manager && manager.business) {
                resolvedBusinessId = manager.business._id;
            }
        }

        const cacheKey = `daily-business:${resolvedBusinessId || managerId}:${startDate}:${endDate}:${page}:${limit}`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        const query = {};
        if (resolvedBusinessId) {
            query.business = resolvedBusinessId;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const records = await DailyBusiness.find(query)
            .populate('business', 'name type branch')
            .populate('manager', 'name username')
            .populate('createdBy', 'name username email phone role')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await DailyBusiness.countDocuments(query);

        const response = {
            success: true,
            data: records.map(r => r.toObject()),
            pagination: {
                total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                pages: Math.ceil(total / limit)
            }
        };

        // Cache for 5 minutes
        await setCache(cacheKey, response, 300);

        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Update Daily Business Record ==================
const updateDailyBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const managerId = req.user.id;

        const dailyBusiness = await DailyBusiness.findById(id);
        if (!dailyBusiness) {
            return res.status(404).json({ success: false, message: "Daily business record not found" });
        }

        // Check if manager has permission to update this record
        if (dailyBusiness.manager.toString() !== managerId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const updatedRecord = await DailyBusiness.findByIdAndUpdate(
            id, 
            { ...updates, updatedAt: new Date() }, 
            { new: true }
        ).populate('business', 'name type branch');

        // Invalidate cache
        await deleteCache(`business:${dailyBusiness.business}:daily-business`);
        await deleteCache(`manager:${managerId}:daily-business`);

        return res.json({
            success: true,
            message: "Daily business record updated successfully",
            data: updatedRecord
        });
    } catch (err) {
        next(err);
    }
};

// ================== Delete Daily Business Record ==================
const deleteDailyBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const managerId = req.user.id;

        const dailyBusiness = await DailyBusiness.findById(id);
        if (!dailyBusiness) {
            return res.status(404).json({ success: false, message: "Daily business record not found" });
        }

        // Check if manager has permission to delete this record
        if (dailyBusiness.manager.toString() !== managerId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        await DailyBusiness.findByIdAndDelete(id);

        // Invalidate cache
        await deleteCache(`business:${dailyBusiness.business}:daily-business`);
        await deleteCache(`manager:${managerId}:daily-business`);

        return res.json({
            success: true,
            message: "Daily business record deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Business Analytics ==================
const getBusinessAnalytics = async (req, res, next) => {
    try {
        const { businessId, period = 'monthly' } = req.query;
        const userRole = req.user?.role;
        const isStaff = userRole === "staff";
        const managerId = isStaff ? req.user.managerId : req.user.id;

        if (isStaff && (!managerId || !req.user.businessId)) {
            return res.status(403).json({
                success: false,
                message: "Staff account is not linked to a manager or business"
            });
        }

        let resolvedBusinessId = isStaff ? req.user.businessId : (businessId || req.user.businessId);

        if (!resolvedBusinessId && userRole === "manager") {
            const manager = await require("../models/Manager").findById(managerId).populate('business');
            if (manager && manager.business) {
                resolvedBusinessId = manager.business._id;
            }
        }

        if (!resolvedBusinessId) {
            return res.status(400).json({
                success: false,
                message: "Business context not found"
            });
        }

        const query = { business: resolvedBusinessId };

        // Set date range based on period
        const endDate = new Date();
        const startDate = new Date();
        
        switch (period) {
            case 'daily':
                startDate.setDate(endDate.getDate() - 1);
                break;
            case 'weekly':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'monthly':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'yearly':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(endDate.getMonth() - 1);
        }

        query.date = { $gte: startDate, $lte: endDate };

        const dailyRecords = await DailyBusiness.find(query)
            .sort({ date: -1 })
            .populate('business', 'name type branch')
            .populate('staffPerformance.staff', 'name role email phone');

        const analytics = generateBusinessAnalytics(dailyRecords, period);

        return res.json({
            success: true,
            data: analytics
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Daily Summary ==================
const getDailySummary = async (req, res, next) => {
    try {
        const { businessId, date } = req.query;
        const userRole = req.user?.role;
        const isStaff = userRole === "staff";
        const managerId = isStaff ? req.user.managerId : req.user.id;

        if (isStaff && (!managerId || !req.user.businessId)) {
            return res.status(403).json({
                success: false,
                message: "Staff account is not linked to a manager or business"
            });
        }

        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        let resolvedBusinessId = isStaff ? req.user.businessId : (businessId || req.user.businessId);

        if (!resolvedBusinessId && userRole === "manager") {
            const manager = await require("../models/Manager").findById(managerId).populate('business');
            if (manager && manager.business) {
                resolvedBusinessId = manager.business._id;
            }
        }

        if (!resolvedBusinessId) {
            return res.status(400).json({
                success: false,
                message: "Business context not found"
            });
        }

        // Get daily business record
        const dailyRecord = await DailyBusiness.findOne({
            business: resolvedBusinessId,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('business', 'name type branch');

        // Get transactions for the day
        const transactions = await Transaction.find({
            business: resolvedBusinessId,
            transactionDate: { $gte: startOfDay, $lte: endOfDay }
        }).populate('staff', 'name role');

        const summary = {
            date: targetDate,
            business: dailyRecord?.business || null,
            dailyRecord: dailyRecord || null,
            transactions,
            totals: {
                revenue: transactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0),
                customers: transactions.length,
                transactions: transactions.length
            }
        };

        return res.json({
            success: true,
            data: summary
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    addDailyBusiness,
    getDailyBusinessRecords,
    updateDailyBusiness,
    deleteDailyBusiness,
    getBusinessAnalytics,
    getDailySummary
};

