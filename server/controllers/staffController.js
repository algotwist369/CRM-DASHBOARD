// staffController.js - Staff operations
const mongoose = require("mongoose");
const Staff = require("../models/Staff");
const Business = require("../models/Business");
const Transaction = require("../models/Transaction");
const Appointment = require("../models/Appointment");
const { deleteCache, setCache, getCache } = require("../utils/cache");

// ================== Get My Profile ==================
const getMyProfile = async (req, res, next) => {
    try {
        const staffId = req.user.id;

        const staff = await Staff.findById(staffId)
            .populate("manager", "name username")
            .populate("business", "name type branch");
        
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        return res.json({ success: true, data: staff });
    } catch (err) {
        next(err);
    }
};

// ================== Update My Profile ==================
const updateMyProfile = async (req, res, next) => {
    try {
        const staffId = req.user.id;
        const updates = req.body;

        const staff = await Staff.findByIdAndUpdate(
            staffId, 
            { ...updates, updatedAt: new Date() }, 
            { new: true }
        ).populate("manager", "name username");
        
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        // Invalidate caches
        await deleteCache(`manager:${staff.manager._id}:staff`);
        await deleteCache(`business:${staff.business}:staff`);

        return res.json({ success: true, message: "Profile updated successfully", data: staff });
    } catch (err) {
        next(err);
    }
};

// ================== Get My Business Info ==================
const getMyBusiness = async (req, res, next) => {
    try {
        const staffId = req.user.id;

        const staff = await Staff.findById(staffId).populate("business");
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        return res.json({ 
            success: true, 
            data: {
                business: staff.business,
                staff: {
                    id: staff._id,
                    name: staff.name,
                    role: staff.role,
                    specialization: staff.specialization
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Staff Dashboard ==================
const getStaffDashboard = async (req, res, next) => {
    try {
        const staffId = req.user.id;
        const cacheKey = `staff:${staffId}:dashboard`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        // Get staff with business and manager info
        const staff = await Staff.findById(staffId)
            .populate('business', 'name type branch address')
            .populate('manager', 'name username');
        
        if (!staff || !staff.business) {
            return res.status(404).json({ success: false, message: "Staff or business not found" });
        }

        const business = staff.business;

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get this month's date range
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Get today's appointments for this staff
        const todayAppointments = await Appointment.find({
            staff: staffId,
            appointmentDate: { $gte: today, $lt: tomorrow }
        }).populate('customer', 'name phone').populate('service', 'name price');

        // Get this month's appointments
        const monthlyAppointments = await Appointment.find({
            staff: staffId,
            appointmentDate: { $gte: startOfMonth }
        });

        // Get today's transactions for this staff
        const todayTransactions = await Transaction.find({
            business: business._id,
            staff: staffId,
            transactionDate: { $gte: today, $lt: tomorrow }
        });

        // Get this month's transactions
        const monthlyTransactions = await Transaction.find({
            business: business._id,
            staff: staffId,
            transactionDate: { $gte: startOfMonth }
        });

        // Calculate stats
        const todayRevenue = todayTransactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
        const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
        const todayCustomers = new Set(todayTransactions.map(t => t.customer?.toString())).size;
        const monthlyCustomers = new Set(monthlyTransactions.map(t => t.customer?.toString())).size;

        // Get upcoming appointments (next 5)
        const upcomingAppointments = await Appointment.find({
            staff: staffId,
            appointmentDate: { $gte: new Date() },
            status: { $in: ['confirmed', 'pending'] }
        })
        .populate('customer', 'name phone')
        .populate('service', 'name price')
        .sort({ appointmentDate: 1 })
        .limit(5);

        const dashboard = {
            staff: {
                id: staff._id,
                name: staff.name,
                username: staff.username,
                role: staff.role,
                specialization: staff.specialization
            },
            manager: staff.manager ? {
                name: staff.manager.name,
                username: staff.manager.username
            } : null,
            business: {
                id: business._id,
                name: business.name,
                type: business.type,
                branch: business.branch,
                address: business.address
            },
            stats: {
                todayAppointments: todayAppointments.length,
                todayRevenue,
                todayCustomers,
                monthlyAppointments: monthlyAppointments.length,
                monthlyRevenue,
                monthlyCustomers,
                totalTransactions: todayTransactions.length
            },
            upcomingAppointments: upcomingAppointments.map(apt => ({
                id: apt._id,
                customerName: apt.customer?.name || 'N/A',
                customerPhone: apt.customer?.phone || 'N/A',
                serviceName: apt.service?.name || 'N/A',
                servicePrice: apt.service?.price || 0,
                appointmentDate: apt.appointmentDate,
                appointmentTime: apt.appointmentTime,
                status: apt.status
            })),
            recentTransactions: todayTransactions.map(t => ({
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

const invalidateTransactionCaches = async (staffId, managerId, businessId) => {
    const patterns = [
        `staff:${staffId}:dashboard`,
        `staff:${staffId}:transactions*`,
        `manager:${managerId}:dashboard`,
        `manager:${managerId}:transactions*`,
        `daily-business:${businessId}:*`,
        `business:${businessId}:daily-business*`
    ];

    await Promise.all(patterns.map((key) => deleteCache(key)));
};

// ================== Add Transaction (Staff) ==================
const addTransaction = async (req, res, next) => {
    try {
        const staffId = req.user.id;
        const {
            customerName,
            customerPhone,
            customerEmail,
            serviceName,
            serviceType,
            serviceCategory,
            basePrice,
            discount = 0,
            tax = 0,
            paymentMethod = "cash",
            notes,
            rating
        } = req.body;

        if (!customerName || !customerName.trim()) {
            return res.status(400).json({ success: false, message: "Customer name is required" });
        }

        if (!serviceName || !serviceName.trim()) {
            return res.status(400).json({ success: false, message: "Service name is required" });
        }

        if (!serviceType || !serviceType.trim()) {
            return res.status(400).json({ success: false, message: "Service type is required" });
        }

        const basePriceNumber = Number(basePrice);
        const discountNumber = Number(discount) || 0;
        const taxNumber = Number(tax) || 0;

        if (!Number.isFinite(basePriceNumber) || basePriceNumber <= 0) {
            return res.status(400).json({ success: false, message: "Base price must be a positive number" });
        }

        if (discountNumber < 0 || taxNumber < 0) {
            return res.status(400).json({ success: false, message: "Discount and tax must not be negative" });
        }

        const staff = await Staff.findById(staffId).populate('manager').populate('business');
        if (!staff || !staff.manager || !staff.business) {
            return res.status(403).json({ success: false, message: "Staff account is not linked to a manager or business" });
        }

        const finalPrice = basePriceNumber - discountNumber + taxNumber;

        const transaction = await Transaction.create({
            business: staff.business._id,
            manager: staff.manager._id,
            staff: staffId,
            customerName: customerName.trim(),
            customerPhone: customerPhone || undefined,
            customerEmail: customerEmail || undefined,
            isNewCustomer: true,
            serviceName: serviceName.trim(),
            serviceType,
            serviceCategory: serviceCategory || undefined,
            basePrice: basePriceNumber,
            discount: discountNumber,
            tax: taxNumber,
            finalPrice,
            paymentMethod,
            paymentStatus: "completed",
            notes: notes || undefined,
            rating: rating ? Number(rating) : undefined,
            transactionDate: new Date()
        });

        await invalidateTransactionCaches(staffId, staff.manager._id, staff.business._id);

        return res.status(201).json({
            success: true,
            message: "Transaction added successfully",
            data: transaction
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get My Transactions ==================
const getMyTransactions = async (req, res, next) => {
    try {
        const staffId = req.user.id;
        const { page = 1, limit = 10, startDate, endDate, serviceType } = req.query;
        const cacheKey = `staff:${staffId}:transactions:${startDate || ""}:${endDate || ""}:${serviceType || ""}:${page}:${limit}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json({ success: true, source: "cache", ...cached });
        }

        const staff = await Staff.findById(staffId).populate('business');
        if (!staff || !staff.business) {
            return res.status(403).json({ success: false, message: "Staff account is not linked to a business" });
        }

        const query = {
            staff: staffId,
            business: staff.business._id
        };

        if (startDate && endDate) {
            query.transactionDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (serviceType) {
            query.serviceType = serviceType;
        }

        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = Math.min(parseInt(limit, 10) || 10, 100);

        const transactions = await Transaction.find(query)
            .populate('manager', 'name username')
            .sort({ transactionDate: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Transaction.countDocuments(query);

        const response = {
            success: true,
            data: transactions.map(t => t.toObject()),
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber)
            }
        };

        await setCache(cacheKey, response, 120);
        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Transaction Details ==================
const getMyTransactionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staffId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid transaction ID" });
        }

        const transaction = await Transaction.findOne({ _id: id, staff: staffId })
            .populate('business', 'name type branch')
            .populate('manager', 'name username')
            .populate('staff', 'name role');

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        return res.json({ success: true, data: transaction });
    } catch (err) {
        next(err);
    }
};

// ================== Update Transaction ==================
const updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staffId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid transaction ID" });
        }

        const transaction = await Transaction.findOne({ _id: id, staff: staffId });
        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        const updates = {};
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
            paymentStatus,
            notes,
            rating
        } = req.body;

        if (customerName !== undefined) {
            if (!customerName.trim()) {
                return res.status(400).json({ success: false, message: "Customer name is required" });
            }
            updates.customerName = customerName.trim();
        }

        if (customerPhone !== undefined) {
            updates.customerPhone = customerPhone || undefined;
        }

        if (customerEmail !== undefined) {
            updates.customerEmail = customerEmail || undefined;
        }

        if (serviceName !== undefined) {
            if (!serviceName.trim()) {
                return res.status(400).json({ success: false, message: "Service name is required" });
            }
            updates.serviceName = serviceName.trim();
        }

        if (serviceType !== undefined) {
            updates.serviceType = serviceType;
        }

        if (serviceCategory !== undefined) {
            updates.serviceCategory = serviceCategory || undefined;
        }

        let finalPrice;
        let basePriceNumber = transaction.basePrice;
        let discountNumber = transaction.discount;
        let taxNumber = transaction.tax;

        if (basePrice !== undefined) {
            basePriceNumber = Number(basePrice);
            if (!Number.isFinite(basePriceNumber) || basePriceNumber <= 0) {
                return res.status(400).json({ success: false, message: "Base price must be a positive number" });
            }
            updates.basePrice = basePriceNumber;
        }

        if (discount !== undefined) {
            discountNumber = Number(discount) || 0;
            if (discountNumber < 0) {
                return res.status(400).json({ success: false, message: "Discount must not be negative" });
            }
            updates.discount = discountNumber;
        }

        if (tax !== undefined) {
            taxNumber = Number(tax) || 0;
            if (taxNumber < 0) {
                return res.status(400).json({ success: false, message: "Tax must not be negative" });
            }
            updates.tax = taxNumber;
        }

        finalPrice = basePriceNumber - discountNumber + taxNumber;
        updates.finalPrice = finalPrice;

        if (paymentMethod !== undefined) {
            updates.paymentMethod = paymentMethod;
        }

        if (paymentStatus !== undefined) {
            updates.paymentStatus = paymentStatus;
        }

        if (notes !== undefined) {
            updates.notes = notes || undefined;
        }

        if (rating !== undefined) {
            if (rating !== '' && (Number(rating) < 1 || Number(rating) > 5)) {
                return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
            }
            updates.rating = rating ? Number(rating) : undefined;
        }

        updates.updatedAt = new Date();

        Object.assign(transaction, updates);
        await transaction.save();

        const staff = await Staff.findById(staffId).populate('manager').populate('business');
        if (staff && staff.manager && staff.business) {
            await invalidateTransactionCaches(staffId, staff.manager._id, staff.business._id);
        }

        return res.json({ success: true, message: "Transaction updated successfully", data: transaction });
    } catch (err) {
        next(err);
    }
};

// ================== Delete Transaction ==================
const deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staffId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid transaction ID" });
        }

        const transaction = await Transaction.findOneAndDelete({ _id: id, staff: staffId });
        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        const staff = await Staff.findById(staffId).populate('manager').populate('business');
        if (staff && staff.manager && staff.business) {
            await invalidateTransactionCaches(staffId, staff.manager._id, staff.business._id);
        }

        return res.json({ success: true, message: "Transaction deleted successfully" });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    getMyBusiness,
    getStaffDashboard,
    addTransaction,
    getMyTransactions,
    getMyTransactionById,
    updateTransaction,
    deleteTransaction
};
