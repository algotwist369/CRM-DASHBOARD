// staffController.js - Staff operations
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
        const staffPromise = Staff.findById(staffId)
            .populate('business', 'name type branch address')
            .populate('manager', 'name username')
            .lean();
        
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get this month's date range
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Run all queries in parallel for better performance
        const [staff, todayAppointments, monthlyAppointments, todayTransactions, monthlyTransactions, upcomingAppointments] = await Promise.all([
            staffPromise,
            // Today's appointments
            Appointment.find({
                staff: staffId,
                appointmentDate: { $gte: today, $lt: tomorrow }
            }).populate('customer', 'name phone').populate('service', 'name price').lean(),
            // Monthly appointments
            Appointment.find({
                staff: staffId,
                appointmentDate: { $gte: startOfMonth }
            }).select('_id').lean(),
            // Today's transactions
            Transaction.find({
                staff: staffId,
                transactionDate: { $gte: today, $lt: tomorrow }
            }).select('finalPrice customer').lean(),
            // Monthly transactions
            Transaction.find({
                staff: staffId,
                transactionDate: { $gte: startOfMonth }
            }).select('finalPrice customer').lean(),
            // Upcoming appointments
            Appointment.find({
                staff: staffId,
                appointmentDate: { $gte: new Date() },
                status: { $in: ['confirmed', 'pending'] }
            })
            .populate('customer', 'name phone')
            .populate('service', 'name price')
            .sort({ appointmentDate: 1 })
            .limit(5)
            .lean()
        ]);
        
        if (!staff || !staff.business) {
            return res.status(404).json({ success: false, message: "Staff or business not found" });
        }

        const business = staff.business;

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

module.exports = {
    getMyProfile,
    updateMyProfile,
    getMyBusiness,
    getStaffDashboard
};
