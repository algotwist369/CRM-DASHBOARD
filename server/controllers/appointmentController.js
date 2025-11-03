// appointmentController.js - Appointment/Booking management
const Appointment = require("../models/Appointment");
const Customer = require("../models/Customer");
const Service = require("../models/Service");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const { setCache, getCache, deleteCache } = require("../utils/cache");

// ================== Create Appointment ==================
const createAppointment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const {
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

        // Calculate pricing
        const servicePrice = service.price;
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
            duration: service.duration,
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
        await deleteCache(`business:${business._id}:appointments`);

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
        const {
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

        const cacheKey = `business:${business._id}:appointments:${page}:${limit}:${status}:${startDate}:${endDate}:${customerId}:${staffId}:${serviceId}`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        // Build query
        let query = { business: business._id };

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
            query.bookingNumber = { $regex: search, $options: 'i' };
        }

        const appointments = await Appointment.find(query)
            .populate('customer', 'firstName lastName phone email')
            .populate('service', 'name price duration')
            .populate('staff', 'name role phone')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ appointmentDate: -1, startTime: -1 })
            .lean();

        const total = await Appointment.countDocuments(query);

        const response = {
            success: true,
            data: appointments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
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
        await deleteCache(`business:${appointment.business}:appointments`);

        return res.json({
            success: true,
            message: "Appointment updated successfully",
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
        await deleteCache(`business:${appointment.business}:appointments`);

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
        await deleteCache(`business:${appointment.business}:appointments`);

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

        await appointment.complete();

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
        await deleteCache(`business:${appointment.business}:appointments`);
        await deleteCache(`business:${appointment.business}:customers`);

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
        await deleteCache(`business:${appointment.business}:appointments`);

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
        await deleteCache(`business:${appointment.business}:appointments`);

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
        await deleteCache(`business:${appointment.business}:appointments`);

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
        const { businessId, startDate, endDate } = req.query;

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

        const cacheKey = `business:${business._id}:appointment:stats:${startDate}:${endDate}`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", data: cachedData });
        }

        // Build date filter
        const dateFilter = { business: business._id };
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

module.exports = {
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
    getAppointmentStats
};
