// managerController.js - Manager operations (staff CRUD, daily business entry)
const Staff = require("../models/Staff");
const DailyBusiness = require("../models/DailyBusiness");
const Transaction = require("../models/Transaction");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const ManagerNotification = require("../models/ManagerNotification");
const Customer = require("../models/Customer");
const Service = require("../models/Service"); // Added for Transaction linking
const Appointment = require("../models/Appointment");
const { setCache, getCache, deleteCache } = require("../utils/cache");

// ================== Manager Dashboard ==================
const getManagerDashboard = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const cacheKey = `manager:${managerId}:dashboard`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        // Get manager and business info
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ success: false, message: "Manager or business not found" });
        }

        const business = manager.business;


        // Date Helpers
        const now = new Date();
        const today = new Date(now); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's transactions (For Recent Transactions List only)
        const todayTransactions = await Transaction.find({
            business: business._id,
            transactionDate: { $gte: today, $lt: tomorrow }
        }).sort({ transactionDate: -1 });

        const dashboard = {
            manager: {
                name: manager.name,
                username: manager.username,
                business: business.name,
                businessType: business.type
            },
            business: {
                id: business._id,
                name: business.name,
                type: business.type,
                branch: business.branch,
                address: business.address
            },
            // stats object removed - frontend now uses getManagerStats API
            recentTransactions: todayTransactions.slice(0, 5).map(t => ({
                id: t._id,
                customerName: t.customerName,
                serviceName: t.serviceName,
                finalPrice: t.finalPrice,
                transactionDate: t.transactionDate
            }))
        };

        // Cache for 5 minutes
        await setCache(cacheKey, dashboard, 300);

        return res.json({ success: true, data: dashboard });
    } catch (err) {
        next(err);
    }
};

// ================== Add Staff ==================
const addStaff = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const {
            name,
            email,
            phone,
            role,
            specialization,
            experience,
            salary,
            commission,
            username,
            pin
        } = req.body;

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        const staff = await Staff.create({
            business: manager.business,
            manager: managerId,
            name,
            email,
            phone,
            role: role || 'stylist',
            username,
            pin,
            specialization,
            experience: experience || 0,
            salary,
            commission: commission || 0
        });

        // Add staff to business
        await Business.findByIdAndUpdate(manager.business, {
            $push: { staff: staff._id }
        });

        // Invalidate caches
        await deleteCache(`manager:${managerId}:staff`);
        await deleteCache(`business:${manager.business}:staff`);

        return res.status(201).json({
            success: true,
            message: "Staff added successfully",
            data: staff,
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Staff ==================
const getStaff = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { page = 1, limit = 10, role, search } = req.query;
        const cacheKey = `manager:${managerId}:staff:${role}:${search}:${page}:${limit}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) return res.json({ success: true, source: "cache", ...cachedData });

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        let query = { business: manager.business, isActive: true };

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const staff = await Staff.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Staff.countDocuments(query);

        const response = {
            success: true,
            data: staff.map(s => s.toObject()),
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

// ================== Update Staff ==================
const updateStaff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const managerId = req.user.id;

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        const staff = await Staff.findOneAndUpdate(
            { _id: id, business: manager.business },
            { ...updates, updatedAt: new Date() },
            { new: true }
        );

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        // Invalidate caches
        await deleteCache(`manager:${managerId}:staff`);
        await deleteCache(`business:${manager.business}:staff`);

        return res.json({ success: true, message: "Staff updated successfully", data: staff });
    } catch (err) {
        next(err);
    }
};

// ================== Delete Staff ==================
const deleteStaff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const managerId = req.user.id;

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        const staff = await Staff.findOneAndUpdate(
            { _id: id, business: manager.business },
            { isActive: false },
            { new: true }
        );

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        // Remove from business staff array
        await Business.findByIdAndUpdate(manager.business, {
            $pull: { staff: staff._id }
        });

        // Invalidate caches
        await deleteCache(`manager:${managerId}:staff`);
        await deleteCache(`business:${manager.business}:staff`);

        return res.json({ success: true, message: "Staff deleted successfully" });
    } catch (err) {
        next(err);
    }
};

// ================== Add Transaction ==================
const addTransaction = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const {
            customerName,
            customerPhone,
            customerEmail,
            serviceName,
            serviceType,
            serviceCategory,
            basePrice,
            discount,
            tax,
            paymentMethod,
            staff,
            notes,
            rating,
            source // Extract source
        } = req.body;

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        let customerId = null;
        let serviceId = null;

        // 1. Try to link Customer (by PhoneOrEmail)
        if (customerPhone || customerEmail) {
            const customerQuery = { business: manager.business };
            if (customerPhone) customerQuery.phone = customerPhone;
            else if (customerEmail) customerQuery.email = customerEmail;

            // Find existing customer to link
            const existingCustomer = await Customer.findOne(customerQuery);
            if (existingCustomer) {
                customerId = existingCustomer._id;
            }
        }

        // 2. Try to link Service (by Name)
        if (serviceName) {
            const existingService = await Service.findOne({
                business: manager.business,
                name: { $regex: new RegExp(`^${serviceName}$`, 'i') } // Fuzzy Match
            });
            if (existingService) {
                serviceId = existingService._id;
            }
        }

        // 3. Final Price Calculation (Allow Override)
        let finalPrice = req.body.finalPrice;
        if (finalPrice === undefined || finalPrice === null) {
            finalPrice = (parseFloat(basePrice) || 0) - (parseFloat(discount) || 0) + (parseFloat(tax) || 0);
        }

        const transaction = await Transaction.create({
            business: manager.business,
            manager: managerId,
            staff,
            customer: customerId, // Linked Ref
            service: serviceId,   // Linked Ref
            customerName,
            customerPhone,
            customerEmail,
            isNewCustomer: !customerId, // logic: if we found them, they aren't new
            serviceName,
            serviceType,
            serviceCategory,
            basePrice,
            discount: discount || 0,
            tax: tax || 0,
            finalPrice,
            paymentMethod: paymentMethod || 'cash',
            paymentStatus: 'completed',
            notes,
            rating,
            source: source || 'walk-in', // Save source
            transactionDate: new Date()
        });

        // Invalidate caches
        await deleteCache(`manager:${managerId}:dashboard`);
        await deleteCache(`business:${manager.business}:transactions`);

        return res.status(201).json({
            success: true,
            message: "Transaction added successfully",
            data: transaction
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Transactions ==================
const getTransactions = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { page = 1, limit = 10, startDate, endDate, serviceType } = req.query;
        const cacheKey = `manager:${managerId}:transactions:${startDate}:${endDate}:${serviceType}:${page}:${limit}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) return res.json({ success: true, source: "cache", ...cachedData });

        // Get manager's business
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        let query = { business: manager.business };

        if (startDate && endDate) {
            query.transactionDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (serviceType) {
            query.serviceType = serviceType;
        }

        const transactions = await Transaction.find(query)
            .populate('staff', 'name role')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ transactionDate: -1 });

        const total = await Transaction.countDocuments(query);

        const response = {
            success: true,
            data: transactions.map(t => t.toObject()),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        };

        await setCache(cacheKey, response, 120);
        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Update Business (Manager can update their own business) ==================
const updateBusiness = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const updates = req.body;

        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ success: false, message: "Manager or business not found" });
        }

        const businessId = manager.business._id;

        // Validate business type if being updated
        if (updates.type) {
            const validTypes = ["salon", "spa", "hotel", "restaurant", "retail", "gym", "clinic", "cafe", "studio", "education", "automotive", "others"];
            if (!validTypes.includes(updates.type)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid business type. Must be one of: ${validTypes.join(', ')}`
                });
            }
        }

        // Managers cannot change certain fields
        delete updates.admin; // Cannot change business owner
        delete updates.isActive; // Cannot deactivate business
        delete updates.businessLink; // Cannot change business link

        // Update business - pre-save hook will extract lat/lng from googleMapsUrl if changed
        const updatedBusiness = await Business.findByIdAndUpdate(
            businessId,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('managers', 'name username email phone isActive');

        if (!updatedBusiness) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        // Invalidate caches
        await deleteCache(`manager:${managerId}:dashboard`);
        await deleteCache(`business:${businessId}:info`);

        return res.json({
            success: true,
            message: "Business updated successfully",
            data: {
                id: updatedBusiness._id,
                name: updatedBusiness.name,
                type: updatedBusiness.type,
                branch: updatedBusiness.branch,
                address: updatedBusiness.address,
                city: updatedBusiness.city,
                state: updatedBusiness.state,
                phone: updatedBusiness.phone,
                email: updatedBusiness.email,
                website: updatedBusiness.website,
                businessLink: updatedBusiness.businessLink,
                location: updatedBusiness.location,
                googleMapsUrl: updatedBusiness.googleMapsUrl,
                images: updatedBusiness.images,
                socialMedia: updatedBusiness.socialMedia,
                registration: updatedBusiness.registration,
                category: updatedBusiness.category,
                tags: updatedBusiness.tags,
                features: updatedBusiness.features,
                amenities: updatedBusiness.amenities,
                paymentMethods: updatedBusiness.paymentMethods,
                bankDetails: updatedBusiness.bankDetails,
                settings: updatedBusiness.settings,
                isActive: updatedBusiness.isActive,
                managers: updatedBusiness.managers,
                updatedAt: updatedBusiness.updatedAt
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Business Info (Manager can view their own business) ==================
const getBusinessInfo = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const cacheKey = `manager:${managerId}:business:info`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", data: cachedData });
        }

        // Get manager's business
        const manager = await Manager.findById(managerId).populate({
            path: 'business',
            populate: [
                { path: 'managers', select: 'name username email phone isActive' },
                { path: 'staff', select: 'name role phone email isActive' }
            ]
        });

        if (!manager || !manager.business) {
            return res.status(404).json({ success: false, message: "Manager or business not found" });
        }

        const business = manager.business;

        // Cache for 10 minutes
        await setCache(cacheKey, business, 600);

        return res.json({ success: true, data: business });
    } catch (err) {
        next(err);
    }
};
// ================== Get Manager Alerts ==================
const getAlerts = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        console.log(`[GetAlerts] Fetching alerts for manager: ${managerId}`);
        const { page = 1, limit = 20, isRead } = req.query;

        const query = { manager: managerId };
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }

        const alerts = await ManagerNotification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        console.log(`[GetAlerts] Found ${alerts.length} alerts for manager ${managerId}`);

        const total = await ManagerNotification.countDocuments(query);
        const unreadCount = await ManagerNotification.countDocuments({ manager: managerId, isRead: false });

        return res.json({
            success: true,
            data: alerts,
            unreadCount,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('[GetAlerts] Error:', err);
        next(err);
    }
};

// ================== Mark Alert as Read ==================
const markAlertAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const managerId = req.user.id;

        const alert = await ManagerNotification.findOne({ _id: id, manager: managerId });
        if (!alert) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        await alert.markAsRead();

        return res.json({ success: true, message: "Marked as read" });
    } catch (err) {
        next(err);
    }
};

// ================== Mark All Alerts as Read ==================
const markAllAlertsAsRead = async (req, res, next) => {
    try {
        const managerId = req.user.id;

        await ManagerNotification.updateMany(
            { manager: managerId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        return res.json({ success: true, message: "All marked as read" });
    } catch (err) {
        next(err);
    }
};

// ================== Create Test Notification (Debug) ==================
const createTestNotification = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const manager = await Manager.findById(managerId);

        console.log(`[TestNotif] Creating test notification for manager ${managerId}`);

        const notif = await ManagerNotification.createNotification(
            managerId,
            manager.business,
            "Test Notification",
            "This is a test notification to verify persistence.",
            {
                type: "system",
                priority: "high",
                metadata: { source: "test_endpoint" }
            }
        );

        console.log(`[TestNotif] Success! Created ${notif._id}`);

        return res.json({ success: true, message: "Test notification created", data: notif });
    } catch (err) {
        console.error('[TestNotif] Failed:', err);
        return res.status(500).json({ success: false, message: err.message, stack: err.stack });
    }
};

// ================== Get Manager Stats ==================
const getManagerStats = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const cacheKey = `manager:${managerId}:stats`;
        const { refresh } = req.query;

        // Try to get from cache (skip if refresh=true)
        if (refresh !== 'true') {
            const cachedData = await getCache(cacheKey);
            if (cachedData) {
                return res.json({ success: true, source: "cache", data: cachedData });
            }
        }

        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }
        const businessId = manager.business;

        // Helper for Date Ranges
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        // 1. Total Staff & Customers
        const totalStaff = await Staff.countDocuments({ business: businessId, isActive: true });
        // 2. Total Revenue (Transactions + Missing Appointments)
        // A. Revenue from Transactions
        const totalTxnStats = await Transaction.aggregate([
            { $match: { business: businessId, paymentStatus: 'completed', isRefunded: false } },
            { $group: { _id: null, total: { $sum: "$finalPrice" }, count: { $sum: 1 } } }
        ]);
        const txnRevenue = totalTxnStats[0]?.total || 0;
        const txnCount = totalTxnStats[0]?.count || 0;

        // B. Revenue from Missing Appointments (Ghost Revenue)
        // Find completed appointments that DO NOT have a transaction linked
        const missingApptStats = await Appointment.aggregate([
            {
                $match: {
                    business: businessId,
                    status: 'completed'
                }
            },
            {
                $lookup: {
                    from: "transactions",
                    localField: "_id",
                    foreignField: "appointment",
                    as: "existingTxn"
                }
            },
            {
                $match: {
                    existingTxn: { $size: 0 } // Filter where NO transaction exists
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            }
        ]);
        const apptRevenue = missingApptStats[0]?.total || 0;
        const apptCount = missingApptStats[0]?.count || 0;

        const totalRevenue = txnRevenue + apptRevenue;
        // Hybrid Total Customers (Visits/Sales)
        const totalCustomers = txnCount + apptCount;

        // Hybrid Total Transactions (Completed Sales/Appts)
        const totalTransactions = txnCount + apptCount;

        // 3. Today's Revenue (Hybrid)
        const todayTxnStats = await Transaction.aggregate([
            { $match: { business: businessId, transactionDate: { $gte: startOfDay, $lte: endOfDay }, paymentStatus: 'completed', isRefunded: false } },
            { $group: { _id: null, total: { $sum: "$finalPrice" }, customers: { $sum: 1 } } }
        ]);

        const todayApptStats = await Appointment.aggregate([
            { $match: { business: businessId, status: 'completed', appointmentDate: { $gte: startOfDay, $lte: endOfDay } } },
            {
                $lookup: {
                    from: "transactions",
                    localField: "_id",
                    foreignField: "appointment",
                    as: "existingTxn"
                }
            },
            { $match: { existingTxn: { $size: 0 } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        const todayRevenue = (todayTxnStats[0]?.total || 0) + (todayApptStats[0]?.total || 0);
        // Note: Customers metric is a bit tricky to combine exactly without overlapping, 
        // but for now summing counts is a safe approximation for distinct interactions.
        const todayCustomers = (todayTxnStats[0]?.customers || 0) + (todayApptStats[0]?.count || 0);

        // 4. Monthly Revenue (Hybrid)
        const monthlyTxnStats = await Transaction.aggregate([
            { $match: { business: businessId, transactionDate: { $gte: startOfMonth }, paymentStatus: 'completed', isRefunded: false } },
            { $group: { _id: null, total: { $sum: "$finalPrice" }, customers: { $sum: 1 } } }
        ]);

        const monthlyApptStats = await Appointment.aggregate([
            { $match: { business: businessId, status: 'completed', appointmentDate: { $gte: startOfMonth } } },
            {
                $lookup: {
                    from: "transactions",
                    localField: "_id",
                    foreignField: "appointment",
                    as: "existingTxn"
                }
            },
            { $match: { existingTxn: { $size: 0 } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        const monthlyRevenue = (monthlyTxnStats[0]?.total || 0) + (monthlyApptStats[0]?.total || 0);
        const monthlyCustomers = (monthlyTxnStats[0]?.customers || 0) + (monthlyApptStats[0]?.count || 0);

        const stats = {
            totalStaff,
            totalCustomers,
            totalRevenue,
            totalTransactions,
            todayRevenue,
            todayCustomers,
            monthlyRevenue,
            monthlyCustomers
        };

        // Cache for 5 minutes
        await setCache(cacheKey, stats, 300);

        // Obfuscate data for response (Base64)
        const encodedStats = Buffer.from(JSON.stringify(stats)).toString('base64');

        return res.json({ success: true, data: encodedStats });
    } catch (err) {
        next(err);
    }
};

// ================== Get Manager Appointment Stats ==================
const getManagerAppointmentStats = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { startDate, endDate, filter } = req.query;

        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        let start, end;
        const now = new Date();

        if (filter === 'tomorrow') {
            const tmr = new Date(now);
            tmr.setDate(tmr.getDate() + 1);
            start = new Date(tmr);
            start.setHours(0, 0, 0, 0);

            end = new Date(tmr);
            end.setHours(23, 59, 59, 999);
        } else if (filter === 'custom' && startDate && endDate) {
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
        } else {
            // Default to Today
            start = new Date(now);
            start.setHours(0, 0, 0, 0);

            end = new Date(now);
            end.setHours(23, 59, 59, 999);
        }

        const stats = await Appointment.aggregate([
            {
                $match: {
                    business: manager.business,
                    appointmentDate: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            total: 0, // Added total
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            no_show: 0,
            in_progress: 0,
            rescheduled: 0
        };

        stats.forEach(s => {
            if (result[s._id] !== undefined) {
                result[s._id] = s.count;
                result.total += s.count; // Accumulate total
            }
        });

        return res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getManagerStats,
    getManagerDashboard,
    addStaff,
    getStaff,
    updateStaff,
    deleteStaff,
    addTransaction,
    getTransactions,
    updateBusiness,
    getBusinessInfo,
    getAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    createTestNotification,
    getManagerAppointmentStats
};
