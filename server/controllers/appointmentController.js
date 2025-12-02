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
            query.bookingNumber = { $regex: search, $options: 'i' };
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
            .select('name type branch address city state country phone email website description settings businessLink images socialMedia location googleMapsUrl ratings features amenities category tags _id')
            .populate('staff', 'name role specialization isActive')
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
            .select('name price duration category serviceType description images')
            .sort({ displayOrder: 1, name: 1 })
            .lean();

        return res.json({
            success: true,
            data: {
                ...business,
                services: services || [],
                staff: business.staff || [],
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

// Book appointment (public - by businessLink)
const bookAppointmentPublic = async (req, res, next) => {
    try {
        const { businessLink } = req.params;
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
        } = req.body;

        // Validate required fields
        if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            return res.status(400).json({
                success: false,
                message: "Customer information (name, email, phone) is required"
            });
        }

        if (!appointmentDate || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Appointment date, start time, and end time are required"
            });
        }

        if (!services || services.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one service is required"
            });
        }

        // Validate payment method if provided
        const validPaymentMethods = ['cash', 'card', 'upi', 'netbanking', 'wallet', 'online'];
        if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`
            });
        }

        // Get business
        const business = await Business.findOne({ businessLink, isActive: true });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            });
        }

        if (!business.settings?.appointmentSettings?.allowOnlineBooking) {
            return res.status(403).json({
                success: false,
                message: "Online booking is not available for this business"
            });
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

            // If already an object, return as is
            if (typeof addressString === 'object' && addressString !== null) {
                return addressString;
            }

            // If it's a string, try to parse it
            if (typeof addressString === 'string') {
                // Try to extract zip code (6 digits at the end)
                const zipMatch = addressString.match(/\b(\d{6})\b/);
                const zipCode = zipMatch ? zipMatch[1] : undefined;

                // Try to extract state (common Indian states)
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

                // Try to extract city (common pattern: city name before state)
                let city = undefined;
                if (state) {
                    const stateIndex = addressString.indexOf(state);
                    const beforeState = addressString.substring(0, stateIndex).trim();
                    // Get the last part before state (likely city)
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
            // Create new customer
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
                source: 'online', // Valid enum values: "walk-in", "online", "referral", "social_media", "advertisement", "other"
                marketingConsent: {
                    email: customerInfo.marketingConsent?.email || false,
                    sms: customerInfo.marketingConsent?.sms || false
                }
            });
        } else {
            // Update customer info if provided
            if (customerInfo.address) {
                customer.address = parseAddress(customerInfo.address);
            }
            if (customerInfo.dateOfBirth) customer.dateOfBirth = new Date(customerInfo.dateOfBirth);
            if (customerInfo.gender) customer.gender = customerInfo.gender;
            await customer.save();
        }

        // Get or create service (use first service for appointment model which supports single service)
        const serviceData = services[0];
        let service = null;

        // Try to find service by ID first
        if (serviceData.serviceId || serviceData._id || serviceData.id) {
            const serviceId = serviceData.serviceId || serviceData._id || serviceData.id;
            service = await Service.findOne({
                _id: serviceId,
                business: business._id,
                isActive: true
            });
        }

        // If not found by ID, try to find by name
        if (!service && serviceData.serviceName) {
            service = await Service.findOne({
                business: business._id,
                name: serviceData.serviceName,
                isActive: true
            });
        }

        // If still not found, create service on the fly
        if (!service && serviceData.serviceName) {
            const servicePayload = {
                business: business._id,
                name: serviceData.serviceName,
                category: serviceData.serviceCategory || 'General',
                serviceType: serviceData.serviceType || 'service',
                isActive: true
            };

            // If pricingOptions provided, use them; otherwise use single price/duration
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
            return res.status(400).json({
                success: false,
                message: "Service not found or could not be created"
            });
        }

        // Calculate pricing from all services (for display purposes)
        const { getServicePriceAndDuration } = require("../utils/appointmentUtils");
        const totalPrice = services.reduce((sum, s) => {
            const { price } = getServicePriceAndDuration(s);
            return sum + price;
        }, 0);
        const totalDuration = services.reduce((sum, s) => {
            const { duration } = getServicePriceAndDuration(s);
            return sum + duration;
        }, 0);

        // Validate booking
        const { validateAppointmentBooking } = require("../utils/appointmentUtils");
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
            return res.status(400).json({
                success: false,
                message: validation.errors.join(', ')
            });
        }

        // Create appointment
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
            paymentMethod: paymentMethod || 'cash', // Accept payment method from request
            status: 'pending',
            createdBy: customer._id,
            createdByModel: 'Customer'
        });

        // Generate confirmation code
        const confirmationCode = appointment.bookingNumber || `CONF${Date.now()}${Math.floor(Math.random() * 1000)}`;
        appointment.bookingNumber = confirmationCode;
        await appointment.save();

        // Populate appointment for response
        await appointment.populate('business', 'name branch address phone');
        await appointment.populate('service', 'name price duration');
        if (appointment.staff) {
            await appointment.populate('staff', 'name role');
        }
        await appointment.populate('customer', 'firstName lastName email phone');

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: {
                appointment: appointment,
                confirmationCode: confirmationCode
            }
        });
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
        await deleteCache(`business:${appointment.business}:appointments`);

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

module.exports = {
    // Public routes
    getBusinessInfoForBooking,
    getAvailableSlotsForBooking,
    bookAppointmentPublic,
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
    getAppointmentStats
};
