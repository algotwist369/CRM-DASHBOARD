// appointmentController.js - Appointment/Booking management
const Appointment = require("../models/Appointment");
const Customer = require("../models/Customer");
const Service = require("../models/Service");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const Transaction = require("../models/Transaction");
const AdminNotification = require("../models/AdminNotification");
const ManagerNotification = require("../models/ManagerNotification");
const { setCache, getCache, deleteCache } = require("../utils/cache");
const { emitToUser } = require("../config/socket");
const Otp = require("../models/OTP");
const { createAndSendOTP, verifyOTP } = require("../utils/sendOTP");
const { sendTemplateSMS, sendTemplateWhatsApp } = require("../utils/sendSMS");

// Helper to notify all relevant users of a business (Admin + Managers)
const notifyBusinessStaff = async (businessId, event, data, notificationData = null) => {
    try {
        const business = await Business.findById(businessId);
        const managers = await Manager.find({ business: businessId, isActive: true });

        console.log(`[NotifyStaff] Found ${managers.length} managers for business ${businessId}`);

        // 1. Create persistent notification for managers FIRST (to avoid race condition)
        if (notificationData && managers.length > 0) {
            console.log('[NotifyStaff] Creating persistent notifications for managers:', notificationData.title);
            const promises = managers.map(async (manager) => {
                try {
                    const notif = await ManagerNotification.createNotification(
                        manager._id,
                        businessId,
                        notificationData.title,
                        notificationData.message,
                        {
                            type: notificationData.type || 'appointment',
                            priority: notificationData.priority || 'normal',
                            relatedAppointment: notificationData.relatedAppointment,
                            actionUrl: notificationData.actionUrl,
                            metadata: notificationData.metadata
                        }
                    );
                    return notif;
                } catch (err) {
                    console.error(`[NotifyStaff] FAILED to create notification for manager ${manager._id}:`, err);
                    return null;
                }
            });
            await Promise.all(promises);
            console.log('[NotifyStaff] All persistent notifications created.');
        } else {
            console.log('[NotifyStaff] Skipping persistent notification: No notificationData or no managers');
        }

        // 2. Notify managers via Socket
        managers.forEach(manager => {
            console.log(`[NotifyStaff] Emitting socket to manager: ${manager._id}`);
            emitToUser(manager._id, event, data);
        });

        // 3. Notify Admin via Socket
        if (business && business.admin) {
            emitToUser(business.admin, event, data);
        }

    } catch (error) {
        console.error('Error notifying business staff:', error);
    }
};

// ================== Create Appointment ==================
const createAppointment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let {
            businessId,
            customerId,
            serviceId,
            staffId,
            appointmentDate,
            startTime,
            endTime,
            customerNotes,
            specialRequests,
            bookingSource = "walk-in",
            paymentMethod = "cash",
            advanceAmount = 0
        } = req.body;

        // Determine business
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        // Verify customer
        const customer = await Customer.findOne({
            _id: customerId,
            business: business._id
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Verify service
        const service = await Service.findOne({
            _id: serviceId,
            business: business._id,
            isActive: true
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found or inactive"
            });
        }

        // Check staff availability if staffId provided
        if (staffId) {
            const isAvailable = await Appointment.checkAvailability(
                business._id,
                staffId,
                new Date(appointmentDate),
                startTime,
                endTime
            );

            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: "Staff is not available at the selected time"
                });
            }
        }

        // Calculate pricing (handle both old format and new pricingOptions)
        const { getServicePriceAndDuration } = require("../utils/appointmentUtils");
        const { price: servicePrice, duration: serviceDuration } = getServicePriceAndDuration(service);
        const discount = 0; // Can be calculated based on loyalty, membership, etc.
        const tax = servicePrice * 0.18; // 18% GST (can be configurable)
        const totalAmount = servicePrice + tax - discount;

        // Create appointment
        const appointment = await Appointment.create({
            business: business._id,
            customer: customerId,
            service: serviceId,
            staff: staffId,
            appointmentDate: new Date(appointmentDate),
            startTime,
            endTime,
            duration: serviceDuration,
            servicePrice,
            tax,
            discount,
            totalAmount,
            customerNotes,
            specialRequests,
            bookingSource,
            paymentMethod,
            advanceAmount,
            paidAmount: advanceAmount,
            paymentStatus: advanceAmount >= totalAmount ? 'paid' : advanceAmount > 0 ? 'partial' : 'pending',
            createdBy: userId,
            createdByModel: userRole === 'admin' ? 'Admin' : 'Manager'
        });

        // Update service stats
        await service.updateStats(totalAmount);

        // Invalidate cache
        await deleteCache(`business:${business._id}:appointments*`);
        await deleteCache(`business:${business._id}:appointment:stats*`);

        // Notify business admin
        // Notify business staff (Admin + Managers)
        // Notify business staff (Admin + Managers)
        await notifyBusinessStaff(business._id, 'new_appointment', {
            message: `New appointment booked for ${customer.firstName} ${customer.lastName}`,
            appointmentId: appointment._id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            serviceName: service.name,
            time: `${appointmentDate} at ${startTime}`,
            data: appointment
        }, {
            // Persistent notification data
            title: 'New Appointment',
            message: `New appointment: ${customer.firstName} ${customer.lastName} - ${service.name} at ${startTime}`,
            type: 'appointment',
            relatedAppointment: appointment._id,
            actionUrl: `/manager/appointments/${appointment._id}`,
            metadata: {
                source: 'system',
                eventId: appointment._id.toString(),
                category: 'appointment'
            }
        });

        // Create persistent notification for Admin
        if (business.admin) {
            await AdminNotification.createSystemNotification(
                business.admin,
                'New Appointment',
                `New appointment booked for ${customer.firstName} ${customer.lastName} - ${service.name}`,
                {
                    type: 'business',
                    priority: 'normal',
                    actionUrl: `/admin/appointments/${appointment._id}`,
                    actionText: 'View Appointment',
                    metadata: {
                        source: 'internal',
                        eventId: appointment._id,
                        category: 'appointment'
                    }
                }
            );
        }

        return res.status(201).json({
            success: true,
            message: "Appointment created successfully",
            data: {
                bookingNumber: appointment.bookingNumber,
                appointmentDate: appointment.appointmentDate,
                startTime: appointment.startTime,
                totalAmount: appointment.totalAmount,
                status: appointment.status
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Appointments ==================
const getAppointments = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let {
            businessId,
            page = 1,
            limit = 20,
            status,
            startDate,
            endDate,
            customerId,
            staffId,
            serviceId,
            search
        } = req.query;

        // Determine business scope
        let query = {};

        if (userRole === 'admin') {
            if (businessId) {
                const business = await Business.findOne({ _id: businessId, admin: userId });
                if (!business) {
                    return res.status(404).json({
                        success: false,
                        message: "Business not found or access denied"
                    });
                }
                query.business = business._id;
            } else {
                // If no businessId provided, fetch for all businesses owned by admin
                const businesses = await Business.find({ admin: userId }).select('_id');
                const businessIds = businesses.map(b => b._id);
                query.business = { $in: businessIds };
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (!manager) {
                return res.status(404).json({
                    success: false,
                    message: "Manager not found"
                });
            }
            query.business = manager.business;
            // Explicitly set businessId for cache key consistent with the query
            businessId = manager.business.toString();
        }

        // Cache key needs to handle multiple businesses or specific business
        const businessKey = businessId ? `business:${businessId}` : `admin:${userId}:all_businesses`;
        const cacheKey = `${businessKey}:appointments:${page}:${limit}:${status}:${startDate}:${endDate}:${customerId}:${staffId}:${serviceId}:${search}`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }


        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.appointmentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            query.appointmentDate = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.appointmentDate = { $lte: new Date(endDate) };
        }

        if (customerId) {
            query.customer = customerId;
        }

        if (staffId) {
            query.staff = staffId;
        }

        if (serviceId) {
            query.service = serviceId;
        }

        if (search) {
            // Search by booking number OR appointment ID
            query.$or = [
                { bookingNumber: { $regex: search, $options: 'i' } },
                { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null } // Only search by _id if valid ObjectId format
            ].filter(condition => condition._id !== null || condition.bookingNumber);
        }

        const appointments = await Appointment.find(query)
            .populate('business', 'name  branch ')
            .populate('customer', 'firstName lastName phone email')
            .populate('service', 'name price duration')
            .populate('staff', 'name role phone')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        // Mark new bookings (created within last 24h)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        appointments.forEach(appointment => {
            if (new Date(appointment.createdAt) > twentyFourHoursAgo) {
                appointment.new = true;
            } else {
                appointment.new = false;
            }
        });

        const total = await Appointment.countDocuments(query);

        // ===========================================
        // Add Revenue Stats (Requested Feature)
        // ===========================================
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        // Transaction Match Query (Scope: Business Only)
        // We use query.business which is already determined above
        const statsMatch = {
            business: query.business,
            paymentStatus: 'completed',
            isRefunded: false
        };

        const [totalRevStats, monthlyRevStats, todayRevStats] = await Promise.all([
            // Total Revenue
            Transaction.aggregate([
                { $match: statsMatch },
                { $group: { _id: null, total: { $sum: "$finalPrice" } } }
            ]),
            // Monthly Revenue
            Transaction.aggregate([
                { $match: { ...statsMatch, transactionDate: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: "$finalPrice" } } }
            ]),
            // Today Revenue
            Transaction.aggregate([
                { $match: { ...statsMatch, transactionDate: { $gte: startOfDay, $lte: endOfDay } } },
                { $group: { _id: null, total: { $sum: "$finalPrice" } } }
            ])
        ]);

        const revenueStats = {
            totalRevenue: totalRevStats[0]?.total || 0,
            monthlyRevenue: monthlyRevStats[0]?.total || 0,
            todayRevenue: todayRevStats[0]?.total || 0
        };

        const response = {
            success: true,
            data: appointments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            revenueStats // Include in response
        };

        // Cache for 2 minutes
        await setCache(cacheKey, response, 120);

        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Appointment by ID ==================
const getAppointmentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id)
            .populate('business', 'name type branch phone email')
            .populate('customer', 'firstName lastName phone email address')
            .populate('service', 'name description price duration category')
            .populate('staff', 'name role phone email')
            .populate('createdBy')
            .populate('cancelledBy')
            .populate('rescheduledBy');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        return res.json({
            success: true,
            data: appointment
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Appointment ==================
const updateAppointment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { id } = req.params;
        const updates = req.body;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Verify access
        if (userRole === 'admin') {
            const business = await Business.findOne({
                _id: appointment.business,
                admin: userId
            });
            if (!business) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager.business.toString() !== appointment.business.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        // Update appointment
        Object.assign(appointment, updates);
        appointment.updatedBy = userId;
        appointment.updatedByModel = userRole === 'admin' ? 'Admin' : 'Manager';

        await appointment.save();

        // Invalidate cache
        await deleteCache(`business:${appointment.business}:appointments*`);
        await deleteCache(`business:${appointment.business}:appointment:stats*`);

        return res.json({
            success: true,
            message: "Appointment updated successfully",
            data: appointment
        });

        // Notify staff
        notifyBusinessStaff(appointment.business, 'appointment_updated', {
            appointmentId: appointment._id,
            status: appointment.status,
            message: `Appointment updated`,
            data: appointment
        });
    } catch (err) {
        next(err);
    }
};

// ================== Confirm Appointment ==================
const confirmAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        await appointment.confirm();

        // Invalidate cache
        // Invalidate cache
        await deleteCache(`business:${appointment.business}:appointments*`);
        await deleteCache(`business:${appointment.business}:appointment:stats*`);

        // Notify staff
        notifyBusinessStaff(appointment.business, 'appointment_updated', {
            appointmentId: appointment._id,
            status: 'confirmed',
            message: `Appointment confirmed`,
            data: appointment
        });

        return res.json({
            success: true,
            message: "Appointment confirmed successfully"
        });
    } catch (err) {
        next(err);
    }
};

// ================== Start Appointment ==================
const startAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        await appointment.start();

        // Invalidate cache
        // Invalidate cache
        await deleteCache(`business:${appointment.business}:appointments*`);
        await deleteCache(`business:${appointment.business}:appointment:stats*`);

        // Notify staff
        notifyBusinessStaff(appointment.business, 'appointment_updated', {
            appointmentId: appointment._id,
            status: 'in_progress',
            message: `Appointment started`,
            data: appointment
        });

        return res.json({
            success: true,
            message: "Appointment started successfully",
            checkInTime: appointment.checkInTime
        });
    } catch (err) {
        next(err);
    }
};

// ================== Complete Appointment ==================
const completeAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { loyaltyPoints = 0 } = req.body;

        const appointment = await Appointment.findById(id)
            .populate('customer');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        if (appointment.status !== 'completed') {
            await appointment.complete();

            // =========================================================
            // AUTO-CREATE TRANSACTION (REVENUE FIX)
            // =========================================================
            // Check if transaction already exists to prevent duplicates
            const existingTransaction = await Transaction.findOne({ appointment: appointment._id });

            if (!existingTransaction) {
                // Find a default manager (admin of business or first manager) - simplified to business owner for now
                // Ideally, we should track which manager/staff completed it.
                // For now, we use the business owner (admin) as manager reference or find a manager.
                // Since this is a critical fix, we'll try to find a manager associated with the business.
                const manager = await Manager.findOne({ business: appointment.business });

                // Create transaction regardless of whether manager is found (Schema now allows optional manager)
                await Transaction.create({
                    business: appointment.business,
                    manager: manager ? manager._id : undefined, // Optional
                    appointment: appointment._id,
                    customer: appointment.customer ? appointment.customer._id : undefined,
                    staff: appointment.staff,

                    customerName: appointment.customer ? appointment.customer.name : (appointment.customerName || 'Walk-in'),
                    customerPhone: appointment.customer ? appointment.customer.phone : (appointment.customerPhone || ''),
                    customerEmail: appointment.customer ? appointment.customer.email : '',

                    serviceName: appointment.serviceName || 'Service',
                    serviceType: appointment.serviceType || 'other',
                    serviceCategory: 'Appointment',

                    basePrice: appointment.totalAmount || 0,
                    finalPrice: appointment.totalAmount || 0,

                    paymentStatus: 'completed',
                    source: 'appointment', // Source as 'appointment'
                    transactionDate: new Date()
                });
            }
            // =========================================================
            // Invalidate ALL managers' dashboard cache for this business
            // This ensures every manager sees the real-time revenue update
            const managers = await Manager.find({ business: appointment.business });
            for (const mgr of managers) {
                await deleteCache(`manager:${mgr._id}:dashboard`);
                await deleteCache(`manager:${mgr._id}:stats`);
            }
            // =========================================================
        }

        // Update customer stats
        if (appointment.customer) {
            await appointment.customer.updateAfterVisit(appointment.totalAmount);

            // Add loyalty points if provided
            if (loyaltyPoints > 0) {
                await appointment.customer.addLoyaltyPoints(loyaltyPoints);
                appointment.loyaltyPointsEarned = loyaltyPoints;
                await appointment.save();
            }
        }

        // Invalidate cache
        // Invalidate cache
        await deleteCache(`business:${appointment.business}:appointments*`);
        await deleteCache(`business:${appointment.business}:appointment:stats*`);
        await deleteCache(`business:${appointment.business}:customers`);

        // Notify staff
        notifyBusinessStaff(appointment.business, 'appointment_updated', {
            appointmentId: appointment._id,
            status: 'completed',
            message: `Appointment completed`,
            data: appointment
        });

        return res.json({
            success: true,
            message: "Appointment completed successfully",
            completedAt: appointment.completedAt,
            actualDuration: appointment.actualDuration
        });
    } catch (err) {
        next(err);
    }
};

// ================== Cancel Appointment ==================
const cancelAppointment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { id } = req.params;
        const { reason, cancellationFee = 0 } = req.body;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        await appointment.cancel(
            reason,
            userId,
            userRole === 'admin' ? 'Admin' : 'Manager',
            cancellationFee
        );

        // Invalidate cache
        // Invalidate cache
        await deleteCache(`business:${appointment.business}:appointments*`);
        await deleteCache(`business:${appointment.business}:appointment:stats*`);

        // Notify staff
        notifyBusinessStaff(appointment.business, 'appointment_cancelled', {
            appointmentId: appointment._id,
            status: 'cancelled',
            message: `Appointment cancelled`,
            data: appointment
        });

        return res.json({
            success: true,
            message: "Appointment cancelled successfully"
        });
    } catch (err) {
        next(err);
    }
};

// ================== Reschedule Appointment ==================
const rescheduleAppointment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { id } = req.params;
        const { newDate, newStartTime, newEndTime, reason } = req.body;

        if (!newDate || !newStartTime || !newEndTime) {
            return res.status(400).json({
                success: false,
                message: "New date and time are required"
            });
        }

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Check availability for new time
        if (appointment.staff) {
            const isAvailable = await Appointment.checkAvailability(
                appointment.business,
                appointment.staff,
                new Date(newDate),
                newStartTime,
                newEndTime
            );

            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: "Staff is not available at the selected time"
                });
            }
        }

        await appointment.reschedule(
            new Date(newDate),
            newStartTime,
            newEndTime,
            reason,
            userId,
            userRole === 'admin' ? 'Admin' : 'Manager'
        );

        // Invalidate cache
        // Invalidate cache
        await deleteCache(`business:${appointment.business}:appointments*`);
        await deleteCache(`business:${appointment.business}:appointment:stats*`);

        // Notify staff
        notifyBusinessStaff(appointment.business, 'appointment_updated', {
            appointmentId: appointment._id,
            status: appointment.status,
            message: `Appointment rescheduled`,
            data: appointment
        });

        return res.json({
            success: true,
            message: "Appointment rescheduled successfully",
            data: {
                newDate: appointment.appointmentDate,
                newStartTime: appointment.startTime,
                newEndTime: appointment.endTime
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Mark No Show ==================
const markNoShow = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        await appointment.markNoShow();

        // Invalidate cache
        // Invalidate cache
        await deleteCache(`business:${appointment.business}:appointments*`);
        await deleteCache(`business:${appointment.business}:appointment:stats*`);

        // Notify staff
        notifyBusinessStaff(appointment.business, 'appointment_updated', {
            appointmentId: appointment._id,
            status: 'no_show',
            message: `Appointment marked as no-show`,
            data: appointment
        });

        return res.json({
            success: true,
            message: "Appointment marked as no-show"
        });
    } catch (err) {
        next(err);
    }
};

// ================== Add Review ==================
const addReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Valid rating (1-5) is required"
            });
        }

        const appointment = await Appointment.findById(id).populate('service');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        if (appointment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: "Can only review completed appointments"
            });
        }

        await appointment.addReview(rating, review);

        // Update service rating
        if (appointment.service) {
            await appointment.service.updateRating(rating);
        }

        return res.json({
            success: true,
            message: "Review added successfully"
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Appointment Statistics ==================
const getAppointmentStats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let { businessId, startDate, endDate } = req.query;

        // Determine business scope
        let dateFilter = {};

        if (userRole === 'admin') {
            if (businessId) {
                const business = await Business.findOne({ _id: businessId, admin: userId });
                if (!business) {
                    return res.status(404).json({
                        success: false,
                        message: "Business not found or access denied"
                    });
                }
                dateFilter.business = business._id;
            } else {
                // If no businessId provided, fetch for all businesses owned by admin
                const businesses = await Business.find({ admin: userId }).select('_id');
                const businessIds = businesses.map(b => b._id);
                dateFilter.business = { $in: businessIds };
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (!manager) {
                return res.status(404).json({
                    success: false,
                    message: "Manager not found"
                });
            }
            dateFilter.business = manager.business;
            // Explicitly set businessId for cache key
            businessId = manager.business.toString();
        }

        const businessKey = businessId ? `business:${businessId}` : `admin:${userId}:all_businesses`;
        const cacheKey = `${businessKey}:appointment:stats:${startDate}:${endDate}`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", data: cachedData });
        }

        if (startDate && endDate) {
            dateFilter.appointmentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Aggregate statistics
        const stats = await Appointment.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalAppointments: { $sum: 1 },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    confirmed: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                    noShows: {
                        $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
                    },
                    totalRevenue: { $sum: '$totalAmount' },
                    averageRevenue: { $avg: '$totalAmount' },
                    totalPaid: { $sum: '$paidAmount' }
                }
            }
        ]);

        const result = stats[0] || {
            totalAppointments: 0,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            noShows: 0,
            totalRevenue: 0,
            averageRevenue: 0,
            totalPaid: 0
        };

        // Cache for 5 minutes
        await setCache(cacheKey, result, 300);

        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

// ================== PUBLIC APPOINTMENT ROUTES (No Authentication) ==================

// Get business info for booking (by businessLink)
const getBusinessInfoForBooking = async (req, res, next) => {
    try {
        const { businessLink } = req.params;

        const business = await Business.findOne({ businessLink, isActive: true })
            .select('name type branch address city state country phone email website description settings businessLink images socialMedia location googleMapsUrl ratings features amenities category tags _id paymentMethods')
            .lean();

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            });
        }

        // Check if online booking is allowed
        if (!business.settings?.appointmentSettings?.allowOnlineBooking) {
            return res.status(403).json({
                success: false,
                message: "Online booking is not available for this business"
            });
        }

        // Fetch services separately
        const services = await Service.find({
            business: business._id,
            isActive: true,
            isAvailableOnline: true
        })
            .select('name category serviceType description images pricingOptions')
            .sort({ displayOrder: 1, name: 1 })
            .lean();

        return res.json({
            success: true,
            data: {
                ...business,
                services: services || [],
                workingHours: business.settings?.workingHours,
                appointmentSettings: business.settings?.appointmentSettings
            }
        });
    } catch (err) {
        next(err);
    }
};

// Get available time slots (by businessLink)
const getAvailableSlotsForBooking = async (req, res, next) => {
    try {
        const { businessLink } = req.params;
        const { date, staffId } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required"
            });
        }

        const business = await Business.findOne({ businessLink, isActive: true })
            .select('settings businessLink')
            .lean();

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            });
        }

        if (!business.settings?.appointmentSettings?.allowOnlineBooking) {
            return res.status(403).json({
                success: false,
                message: "Online booking is not available"
            });
        }

        const appointmentDate = new Date(date);
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get existing appointments for the date
        const query = {
            business: business._id,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled', 'no_show'] }
        };

        if (staffId) {
            query.staff = staffId;
        }

        const existingAppointments = await Appointment.find(query)
            .select('startTime endTime staff')
            .lean();

        // Generate available slots
        const { generateAvailableSlots } = require("../utils/appointmentUtils");
        const slots = generateAvailableSlots(
            business,
            appointmentDate,
            existingAppointments,
            staffId || null
        );

        return res.json({
            success: true,
            data: {
                date: date,
                availableSlots: slots.map(slot => slot.startTime),
                slots: slots
            }
        });
    } catch (err) {
        next(err);
    }
};

// Helper: Execute Booking Logic (Refactored)
const executeBooking = async (bookingData, businessLink) => {
    const {
        customerInfo,
        appointmentDate,
        startTime,
        endTime,
        services,
        staffId,
        customerNotes,
        specialRequests,
        paymentMethod
    } = bookingData;

    // Validate required fields
    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        return { success: false, status: 400, message: "Customer information (name, email, phone) is required" };
    }

    if (!appointmentDate || !startTime || !endTime) {
        return { success: false, status: 400, message: "Appointment date, start time, and end time are required" };
    }

    if (!services || services.length === 0) {
        return { success: false, status: 400, message: "At least one service is required" };
    }

    // Validate payment method if provided
    const validPaymentMethods = ['cash', 'card', 'upi', 'netbanking', 'wallet', 'online'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
        return { success: false, status: 400, message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}` };
    }

    // Get business
    const business = await Business.findOne({ businessLink, isActive: true });

    if (!business) {
        return { success: false, status: 404, message: "Business not found" };
    }

    if (!business.settings?.appointmentSettings?.allowOnlineBooking) {
        return { success: false, status: 403, message: "Online booking is not available for this business" };
    }

    // Find or create customer
    let customer = await Customer.findOne({
        business: business._id,
        $or: [
            { email: customerInfo.email },
            { phone: customerInfo.phone }
        ]
    });

    // Helper function to parse address string into object
    const parseAddress = (addressString) => {
        if (!addressString) return undefined;

        if (typeof addressString === 'object' && addressString !== null) {
            return addressString;
        }

        if (typeof addressString === 'string') {
            const zipMatch = addressString.match(/\b(\d{6})\b/);
            const zipCode = zipMatch ? zipMatch[1] : undefined;

            const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
                'West Bengal', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Andhra Pradesh',
                'Telangana', 'Kerala', 'Madhya Pradesh', 'Bihar', 'Odisha', 'Assam'];
            let state = undefined;
            for (const s of states) {
                if (addressString.includes(s)) {
                    state = s;
                    break;
                }
            }

            let city = undefined;
            if (state) {
                const stateIndex = addressString.indexOf(state);
                const beforeState = addressString.substring(0, stateIndex).trim();
                const parts = beforeState.split(',').map(p => p.trim()).filter(p => p);
                if (parts.length > 0) {
                    city = parts[parts.length - 1];
                }
            }

            return {
                street: addressString,
                city: city,
                state: state,
                country: 'India',
                zipCode: zipCode
            };
        }

        return undefined;
    };

    if (!customer) {
        const [firstName, ...lastNameParts] = customerInfo.name.split(' ');
        customer = await Customer.create({
            business: business._id,
            firstName: firstName,
            lastName: lastNameParts.join(' ') || '',
            email: customerInfo.email,
            phone: customerInfo.phone,
            dateOfBirth: customerInfo.dateOfBirth ? new Date(customerInfo.dateOfBirth) : undefined,
            gender: customerInfo.gender || undefined,
            address: parseAddress(customerInfo.address),
            preferences: customerInfo.preferences || {},
            customerType: 'new',
            source: 'online',
            marketingConsent: {
                email: customerInfo.marketingConsent?.email || false,
                sms: customerInfo.marketingConsent?.sms || false
            }
        });
    } else {
        if (customerInfo.address) {
            customer.address = parseAddress(customerInfo.address);
        }
        if (customerInfo.dateOfBirth) customer.dateOfBirth = new Date(customerInfo.dateOfBirth);
        if (customerInfo.gender) customer.gender = customerInfo.gender;
        await customer.save();
    }

    const serviceData = services[0];
    let service = null;

    if (serviceData.serviceId || serviceData._id || serviceData.id) {
        const serviceId = serviceData.serviceId || serviceData._id || serviceData.id;
        service = await Service.findOne({
            _id: serviceId,
            business: business._id,
            isActive: true
        });
    }

    if (!service && serviceData.serviceName) {
        service = await Service.findOne({
            business: business._id,
            name: serviceData.serviceName,
            isActive: true
        });
    }

    if (!service && serviceData.serviceName) {
        const servicePayload = {
            business: business._id,
            name: serviceData.serviceName,
            category: serviceData.serviceCategory || 'General',
            serviceType: serviceData.serviceType || 'service',
            isActive: true
        };

        if (serviceData.pricingOptions && Array.isArray(serviceData.pricingOptions) && serviceData.pricingOptions.length > 0) {
            servicePayload.pricingOptions = serviceData.pricingOptions;
            servicePayload.pricingType = 'variable';
        } else {
            servicePayload.price = serviceData.price || 0;
            servicePayload.duration = serviceData.duration || 60;
            servicePayload.pricingType = 'fixed';
        }

        service = await Service.create(servicePayload);
    }

    if (!service) {
        return { success: false, status: 400, message: "Service not found or could not be created" };
    }

    const { getServicePriceAndDuration, validateAppointmentBooking } = require("../utils/appointmentUtils");
    const totalPrice = services.reduce((sum, s) => {
        const { price } = getServicePriceAndDuration(s);
        return sum + price;
    }, 0);
    const totalDuration = services.reduce((sum, s) => {
        const { duration } = getServicePriceAndDuration(s);
        return sum + duration;
    }, 0);

    const appointmentDateObj = new Date(appointmentDate);
    const startOfDay = new Date(appointmentDateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
        business: business._id,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['cancelled', 'no_show'] }
    });

    const validation = validateAppointmentBooking({
        appointmentDate,
        startTime,
        endTime,
        staff: staffId
    }, business, existingAppointments);

    if (!validation.isValid) {
        return { success: false, status: 400, message: validation.errors.join(', ') };
    }

    const appointment = await Appointment.create({
        business: business._id,
        customer: customer._id,
        service: service._id,
        staff: staffId || undefined,
        appointmentDate: appointmentDateObj,
        startTime: startTime,
        endTime: endTime,
        duration: totalDuration,
        servicePrice: totalPrice,
        totalAmount: totalPrice,
        customerNotes: customerNotes || '',
        specialRequests: specialRequests || '',
        bookingSource: 'online',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod || 'cash',
        status: 'pending',
        createdBy: customer._id,
        createdByModel: 'Customer'
    });

    const confirmationCode = appointment.bookingNumber || `CONF${Date.now()}${Math.floor(Math.random() * 1000)}`;
    appointment.bookingNumber = confirmationCode;
    await appointment.save();

    await notifyBusinessStaff(business._id, 'new_appointment', {
        message: `New online booking: ${customer.firstName} ${customer.lastName}`,
        appointmentId: appointment._id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        serviceName: service.name,
        time: `${appointmentDate} at ${startTime}`,
        source: 'online',
        data: appointment
    }, {
        title: 'New Online Booking',
        message: `New online booking: ${customer.firstName} ${customer.lastName} - ${service.name} at ${startTime}`,
        type: 'appointment',
        priority: 'high',
        relatedAppointment: appointment._id,
        actionUrl: `/manager/appointments/${appointment._id}`,
        metadata: {
            source: 'online',
            eventId: appointment._id.toString(),
            category: 'appointment'
        }
    });

    if (business.admin) {
        await AdminNotification.createSystemNotification(
            business.admin,
            'New Online Booking',
            `New online booking received from ${customer.firstName} ${customer.lastName} for ${service.name}`,
            {
                type: 'business',
                priority: 'high',
                actionUrl: `/admin/appointments/${appointment._id}`,
                actionText: 'View Booking',
                metadata: {
                    source: 'online',
                    eventId: appointment._id,
                    category: 'appointment'
                }
            }
        );
    }

    await appointment.populate('business', 'name branch address phone');
    await appointment.populate('service', 'name price duration');
    if (appointment.staff) {
        await appointment.populate('staff', 'name role');
    }
    await appointment.populate('customer', 'firstName lastName email phone');

    return {
        success: true,
        message: "Appointment booked successfully",
        data: {
            appointment: appointment,
            confirmationCode: confirmationCode
        }
    };
};

// Book appointment (public - by businessLink) - STEP 1 (OTP Request)
const bookAppointmentPublic = async (req, res, next) => {
    try {
        const { businessLink } = req.params;
        const bookingData = req.body;
        const { customerInfo, appointmentDate, startTime, endTime, services } = bookingData;

        if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            return res.status(400).json({ success: false, message: "Customer information required" });
        }
        if (!appointmentDate || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: "Date and time required" });
        }
        if (!services || services.length === 0) {
            return res.status(400).json({ success: false, message: "Service required" });
        }

        const business = await Business.findOne({ businessLink, isActive: true });
        if (!business) return res.status(404).json({ success: false, message: "Business not found" });

        const phone = customerInfo.phone;
        let response;
        try {
            response = await createAndSendOTP({ mode: 'sms', to: phone });
        } catch (err) {
            console.error("OTP Send Failed:", err);
            // Return proper error for client handling
            return res.status(500).json({ success: false, message: "Failed to send OTP. Please check the number or try again." });
        }

        await Otp.create({
            phone: phone,
            otp: response.otpHash,
            metadata: {
                bookingData,
                businessLink
            },
            expiresAt: new Date(response.expiresAt)
        });

        return res.json({
            success: true,
            message: "OTP sent to your mobile number. Please verify to complete booking.",
            requiresOTP: true,
            phone: phone,
            expiresAt: response.expiresAt
        });

    } catch (err) {
        next(err);
    }
};

// Verify OTP and Complete Booking - STEP 2
const verifyBookingOTP = async (req, res, next) => {
    try {
        const { businessLink } = req.params;
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: "Phone and OTP required" });
        }

        const otpRecord = await Otp.findOne({
            phone,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "OTP not found or expired" });
        }

        const isValid = verifyOTP(otp, otpRecord.otp, otpRecord.expiresAt);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        const { bookingData } = otpRecord.metadata || {};
        if (!bookingData) {
            return res.status(400).json({ success: false, message: "Session expired or invalid data" });
        }

        const result = await executeBooking(bookingData, businessLink);

        if (!result.success) {
            return res.status(result.status || 400).json(result);
        }

        await Otp.findByIdAndDelete(otpRecord._id);

        // Send confirmation notifications (Async)
        try {
            const appointment = result.data.appointment;
            if (appointment) {
                const notificationData = {
                    customerName: appointment.customer.firstName,
                    businessName: appointment.business.name,
                    appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString('en-IN'),
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    services: appointment.service.name,
                    confirmationCode: appointment.bookingNumber
                };

                const phone = appointment.customer.phone;

                // Send WhatsApp
                console.log(`[Notification] Sending WhatsApp to ${phone}...`);
                sendTemplateWhatsApp({
                    to: phone,
                    template: 'appointment_confirmation',
                    data: notificationData
                })
                    .then(res => console.log(`[Notification] WhatsApp sent details:`, JSON.stringify(res)))
                    .catch(err => console.error('[Notification] WhatsApp confirmation failed:', err.message));

                // Send SMS
                console.log(`[Notification] Sending SMS to ${phone}...`);
                sendTemplateSMS({
                    to: phone,
                    template: 'appointment_confirmation',
                    data: notificationData
                })
                    .then(res => console.log(`[Notification] SMS sent details:`, JSON.stringify(res)))
                    .catch(err => console.error('[Notification] SMS confirmation failed:', err.message));
            }
        } catch (notifyErr) {
            console.error('Notification error:', notifyErr);
        }

        return res.status(201).json(result);

    } catch (err) {
        next(err);
    }
};

// Get appointment by confirmation code (public)
const getAppointmentByConfirmationCode = async (req, res, next) => {
    try {
        const { confirmationCode } = req.params;

        const appointment = await Appointment.findOne({ bookingNumber: confirmationCode })
            .populate('business', 'name branch address city state country phone email website')
            .populate('service', 'name price duration category serviceType description')
            .populate('staff', 'name role specialization phone email')
            .populate('customer', 'firstName lastName email phone address dateOfBirth gender')
            .lean();

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        return res.json({
            success: true,
            data: {
                ...appointment,
                confirmationCode: appointment.bookingNumber
            }
        });
    } catch (err) {
        next(err);
    }
};

// Cancel appointment by confirmation code (public)
const cancelAppointmentByCode = async (req, res, next) => {
    try {
        const { confirmationCode } = req.params;
        const { reason } = req.body;

        const appointment = await Appointment.findOne({ bookingNumber: confirmationCode })
            .populate('business');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        if (appointment.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Appointment is already cancelled"
            });
        }

        if (appointment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel a completed appointment"
            });
        }

        // Check cancellation policy
        const { canCancelAppointment } = require("../utils/appointmentUtils");
        const cancellationCheck = canCancelAppointment(appointment, appointment.business);

        if (!cancellationCheck.canCancel) {
            return res.status(400).json({
                success: false,
                message: cancellationCheck.reason
            });
        }

        // Cancel appointment
        appointment.status = 'cancelled';
        appointment.cancellationReason = reason || 'Cancelled by customer';
        appointment.cancelledAt = new Date();
        appointment.cancelledBy = appointment.customer;
        appointment.cancelledByModel = 'Customer';
        await appointment.save();

        // Invalidate cache
        await deleteCache(`business:${appointment.business}:appointments*`);
        await deleteCache(`business:${appointment.business}:appointment:stats*`);

        return res.json({
            success: true,
            message: "Appointment cancelled successfully",
            data: {
                appointment: appointment,
                refundAmount: cancellationCheck.refundAmount || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Appointment Status ==================
const updateAppointmentStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { id } = req.params;
        const { status, notes } = req.body;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Verify access (same as updateAppointment)
        if (userRole === 'admin') {
            const business = await Business.findOne({
                _id: appointment.business,
                admin: userId
            });
            if (!business) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager.business.toString() !== appointment.business.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        // Update status logic
        const oldStatus = appointment.status;
        appointment.status = status;

        // Handle specific status logic if needed (e.g., setting completedAt)
        if (status === 'completed' && !appointment.completedAt) {
            appointment.completedAt = new Date();
            appointment.paymentStatus = 'paid'; // Assume paid if completed via quick update
        } else if (status === 'cancelled' && !appointment.cancelledAt) {
            appointment.cancelledAt = new Date();
            appointment.cancelledBy = userId;
            appointment.cancelledByModel = userRole === 'admin' ? 'Admin' : 'Manager';
        } else if (status === 'in_progress' && !appointment.checkInTime) {
            appointment.checkInTime = new Date();
        }

        if (notes) {
            appointment.staffNotes = notes;
        }

        appointment.updatedBy = userId;
        appointment.updatedByModel = userRole === 'admin' ? 'Admin' : 'Manager';

        await appointment.save();

        // Invalidate cache
        await deleteCache(`business:${appointment.business}:appointments*`);
        await deleteCache(`business:${appointment.business}:appointment:stats*`);
        if (status === 'completed') {
            await deleteCache(`business:${appointment.business}:customers`);
        }

        // Notify staff
        notifyBusinessStaff(appointment.business, 'appointment_updated', {
            appointmentId: appointment._id,
            status: status,
            message: `Appointment status updated to ${status}`,
            data: appointment
        });

        return res.json({
            success: true,
            message: "Appointment status updated successfully",
            data: appointment
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    // Public routes
    getBusinessInfoForBooking,
    getAvailableSlotsForBooking,
    bookAppointmentPublic,
    verifyBookingOTP,
    getAppointmentByConfirmationCode,
    cancelAppointmentByCode,
    // Protected routes
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    confirmAppointment,
    startAppointment,
    completeAppointment,
    cancelAppointment,
    rescheduleAppointment,
    markNoShow,
    addReview,
    getAppointmentStats,
    updateAppointmentStatus
};
