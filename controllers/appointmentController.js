// appointmentController.js - Appointment booking and management

const Appointment = require("../models/Appointment");
const Customer = require("../models/Customer");
const Business = require("../models/Business");
const Staff = require("../models/Staff");
const { setCache, getCache, deleteCache } = require("../utils/cache");
const { 
    generateAvailableSlots, 
    validateAppointmentBooking, 
    calculateAppointmentPricing,
    generateConfirmationMessage,
    canCancelAppointment,
    formatTime,
    getBusinessServices
} = require("../utils/appointmentUtils");

// ================== Public: Get Business Info for Booking ==================
const getBusinessForBooking = async (req, res, next) => {
    try {
        const { businessLink } = req.params;
        
        const business = await Business.findOne({ businessLink, isActive: true })
            .populate('staff', 'name role specialization isActive')
            .select('name type branch address phone email website description settings');
        
        if (!business) {
            return res.status(404).json({ 
                success: false, 
                message: "Business not found or not accepting online bookings" 
            });
        }
        
        // Check if online booking is allowed
        if (!business.settings.appointmentSettings.allowOnlineBooking) {
            return res.status(403).json({ 
                success: false, 
                message: "Online booking is not available for this business" 
            });
        }
        
        // Get available services
        const services = getBusinessServices(business.type);
        
        const businessInfo = {
            id: business._id,
            name: business.name,
            type: business.type,
            branch: business.branch,
            address: business.address,
            phone: business.phone,
            email: business.email,
            website: business.website,
            description: business.description,
            workingHours: business.settings.workingHours,
            appointmentSettings: business.settings.appointmentSettings,
            staff: business.staff.filter(s => s.isActive),
            services: services
        };
        
        return res.json({ success: true, data: businessInfo });
    } catch (err) {
        next(err);
    }
};

// ================== Public: Get Business Info for Booking (by businessId) ==================
const getBusinessForBookingById = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        
        const business = await Business.findById(businessId)
            .populate('staff', 'name role specialization isActive')
            .select('name type branch address phone email website description settings');
        
        if (!business || !business.isActive) {
            return res.status(404).json({ 
                success: false, 
                message: "Business not found" 
            });
        }
        
        // Check if online booking is allowed
        if (!business.settings.appointmentSettings.allowOnlineBooking) {
            return res.status(403).json({ 
                success: false, 
                message: "Online booking is not available for this business" 
            });
        }
        
        // Get available services
        const services = getBusinessServices(business.type);
        
        const businessInfo = {
            id: business._id,
            name: business.name,
            type: business.type,
            branch: business.branch,
            address: business.address,
            phone: business.phone,
            email: business.email,
            website: business.website,
            description: business.description,
            workingHours: business.settings.workingHours,
            appointmentSettings: business.settings.appointmentSettings,
            staff: business.staff.filter(s => s.isActive),
            services: services
        };
        
        return res.json({ success: true, data: businessInfo });
    } catch (err) {
        next(err);
    }
};

// ================== Public: Get Available Time Slots ==================
const getAvailableSlots = async (req, res, next) => {
    try {
        const { businessLink } = req.params;
        const { date, staffId } = req.query;
        
        if (!date) {
            return res.status(400).json({ 
                success: false, 
                message: "Date is required" 
            });
        }
        
        const business = await Business.findOne({ businessLink, isActive: true });
        if (!business) {
            return res.status(404).json({ 
                success: false, 
                message: "Business not found" 
            });
        }
        
        // Get existing appointments for the date
        const appointmentDate = new Date(date);
        const existingAppointments = await Appointment.find({
            business: business._id,
            appointmentDate: {
                $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
                $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
            },
            status: { $nin: ['cancelled', 'no_show'] }
        }).select('startTime endTime staff');
        
        // Generate available slots
        const availableSlots = generateAvailableSlots(
            business, 
            appointmentDate, 
            existingAppointments, 
            staffId
        );
        
        return res.json({ 
            success: true, 
            data: {
                date: date,
                businessId: business._id,
                availableSlots: availableSlots,
                slotDuration: business.settings.appointmentSettings.slotDuration
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Public: Get Available Time Slots (by businessId) ==================
const getAvailableSlotsById = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const { date, staffId } = req.query;
        
        if (!date) {
            return res.status(400).json({ 
                success: false, 
                message: "Date is required" 
            });
        }
        
        const business = await Business.findById(businessId);
        if (!business || !business.isActive) {
            return res.status(404).json({ 
                success: false, 
                message: "Business not found" 
            });
        }
        
        // Get existing appointments for the date
        const appointmentDate = new Date(date);
        const existingAppointments = await Appointment.find({
            business: business._id,
            appointmentDate: {
                $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
                $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
            },
            status: { $nin: ['cancelled', 'no_show'] }
        }).select('startTime endTime staff');
        
        // Generate available slots
        const availableSlots = generateAvailableSlots(
            business, 
            appointmentDate, 
            existingAppointments, 
            staffId
        );
        
        return res.json({ 
            success: true, 
            data: {
                date: date,
                businessId: business._id,
                availableSlots: availableSlots,
                slotDuration: business.settings.appointmentSettings.slotDuration
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Public: Book Appointment ==================
const bookAppointment = async (req, res, next) => {
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
            specialRequests
        } = req.body;
        
        // Get business
        const business = await Business.findOne({ businessLink, isActive: true });
        if (!business) {
            return res.status(404).json({ 
                success: false, 
                message: "Business not found" 
            });
        }
        
        // Check if online booking is allowed
        if (!business.settings.appointmentSettings.allowOnlineBooking) {
            return res.status(403).json({ 
                success: false, 
                message: "Online booking is not available" 
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
        
        if (!customer) {
            customer = await Customer.create({
                business: business._id,
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone,
                dateOfBirth: customerInfo.dateOfBirth,
                gender: customerInfo.gender,
                address: customerInfo.address,
                preferences: {
                    notes: customerInfo.preferences?.notes
                }
            });
        } else {
            // Update customer info if provided
            await Customer.findByIdAndUpdate(customer._id, {
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone,
                dateOfBirth: customerInfo.dateOfBirth,
                gender: customerInfo.gender,
                address: customerInfo.address
            });
        }
        
        // Get existing appointments for validation
        const appointmentDateObj = new Date(appointmentDate);
        const existingAppointments = await Appointment.find({
            business: business._id,
            appointmentDate: {
                $gte: new Date(appointmentDateObj.setHours(0, 0, 0, 0)),
                $lt: new Date(appointmentDateObj.setHours(23, 59, 59, 999))
            },
            status: { $nin: ['cancelled', 'no_show'] }
        });
        
        // Validate appointment booking
        const validation = validateAppointmentBooking({
            appointmentDate: appointmentDate,
            startTime: startTime,
            endTime: endTime,
            staff: staffId
        }, business, existingAppointments);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Booking validation failed",
                errors: validation.errors
            });
        }
        
        // Calculate pricing
        const pricing = calculateAppointmentPricing(services, customer, business);
        
        // Create appointment
        const appointment = await Appointment.create({
            business: business._id,
            customer: customer._id,
            staff: staffId,
            appointmentDate: appointmentDate,
            startTime: startTime,
            endTime: endTime,
            duration: pricing.totalDuration,
            services: services,
            totalPrice: pricing.totalPrice,
            discount: pricing.discount,
            tax: pricing.tax,
            finalPrice: pricing.finalPrice,
            bookingSource: 'online',
            customerNotes: customerNotes,
            specialRequests: specialRequests || [],
            status: 'pending'
        });
        
        // Populate appointment data for response
        await appointment.populate([
            { path: 'customer', select: 'name email phone' },
            { path: 'staff', select: 'name role specialization' },
            { path: 'business', select: 'name branch phone address' }
        ]);
        
        // Generate confirmation message
        const confirmationMessage = generateConfirmationMessage(
            appointment, 
            business, 
            customer
        );
        
        // Invalidate caches
        await deleteCache(`business:${business._id}:appointments`);
        await deleteCache(`business:${business._id}:slots:${appointmentDate}`);
        
        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: {
                appointment: appointment.toObject(),
                confirmationCode: appointment.confirmationCode,
                confirmationMessage: confirmationMessage,
                pricing: pricing.breakdown
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Public: Book Appointment (by businessId) ==================
const bookAppointmentById = async (req, res, next) => {
    try {
        const {
            businessId,
            customerInfo,
            appointmentDate,
            startTime,
            endTime,
            services,
            staffId,
            customerNotes,
            specialRequests
        } = req.body;
        
        // Get business
        const business = await Business.findById(businessId);
        if (!business || !business.isActive) {
            return res.status(404).json({ 
                success: false, 
                message: "Business not found" 
            });
        }
        
        // Check if online booking is allowed
        if (!business.settings.appointmentSettings.allowOnlineBooking) {
            return res.status(403).json({ 
                success: false, 
                message: "Online booking is not available" 
            });
        }
        
        // Find or create customer
        let customer = await Customer.findOne({ 
            phone: customerInfo.phone,
            business: business._id 
        });
        
        if (!customer) {
            customer = await Customer.create({
                business: business._id,
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone,
                source: 'online_booking'
            });
        }
        
        // Get existing appointments for the date
        const appointmentDateObj = new Date(appointmentDate);
        const existingAppointments = await Appointment.find({
            business: business._id,
            appointmentDate: {
                $gte: new Date(appointmentDateObj.setHours(0, 0, 0, 0)),
                $lt: new Date(appointmentDateObj.setHours(23, 59, 59, 999))
            },
            status: { $nin: ['cancelled', 'no_show'] }
        });
        
        // Validate appointment booking
        const validation = validateAppointmentBooking({
            appointmentDate: appointmentDate,
            startTime: startTime,
            endTime: endTime,
            staff: staffId
        }, business, existingAppointments);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Booking validation failed",
                errors: validation.errors
            });
        }
        
        // Calculate pricing
        const pricing = calculateAppointmentPricing(services, customer, business);
        
        // Create appointment
        const appointment = await Appointment.create({
            business: business._id,
            customer: customer._id,
            staff: staffId,
            appointmentDate: appointmentDate,
            startTime: startTime,
            endTime: endTime,
            duration: pricing.totalDuration,
            services: services,
            totalPrice: pricing.totalPrice,
            discount: pricing.discount,
            tax: pricing.tax,
            finalPrice: pricing.finalPrice,
            bookingSource: 'online',
            customerNotes: customerNotes,
            specialRequests: specialRequests || [],
            status: 'pending'
        });
        
        // Populate appointment data for response
        await appointment.populate([
            { path: 'customer', select: 'name email phone' },
            { path: 'staff', select: 'name role specialization' },
            { path: 'business', select: 'name branch phone address' }
        ]);
        
        // Generate confirmation message
        const confirmationMessage = generateConfirmationMessage(
            appointment, 
            business, 
            customer
        );
        
        // Invalidate caches
        await deleteCache(`business:${business._id}:appointments`);
        await deleteCache(`business:${business._id}:slots:${appointmentDate}`);
        
        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: {
                appointment: appointment.toObject(),
                confirmationCode: appointment.confirmationCode,
                confirmationMessage: confirmationMessage,
                pricing: pricing.breakdown
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Public: Get Appointment by Confirmation Code ==================
const getAppointmentByCode = async (req, res, next) => {
    try {
        const { confirmationCode } = req.params;
        
        const appointment = await Appointment.findOne({ confirmationCode })
            .populate('customer', 'name email phone')
            .populate('staff', 'name role specialization')
            .populate('business', 'name branch phone address');
        
        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                message: "Appointment not found" 
            });
        }
        
        return res.json({ 
            success: true, 
            data: appointment.toObject() 
        });
    } catch (err) {
        next(err);
    }
};

// ================== Public: Cancel Appointment ==================
const cancelAppointment = async (req, res, next) => {
    try {
        const { confirmationCode } = req.params;
        const { reason } = req.body;
        
        const appointment = await Appointment.findOne({ confirmationCode })
            .populate('business');
        
        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                message: "Appointment not found" 
            });
        }
        
        // Check if appointment can be cancelled
        const cancellationCheck = canCancelAppointment(appointment, appointment.business);
        
        if (!cancellationCheck.canCancel) {
            return res.status(400).json({
                success: false,
                message: cancellationCheck.reason
            });
        }
        
        // Update appointment status
        appointment.status = 'cancelled';
        appointment.cancelledAt = new Date();
        appointment.cancellationReason = reason;
        appointment.cancelledBy = 'customer';
        
        await appointment.save();
        
        // Invalidate caches
        await deleteCache(`business:${appointment.business._id}:appointments`);
        await deleteCache(`business:${appointment.business._id}:slots:${appointment.appointmentDate}`);
        
        return res.json({
            success: true,
            message: "Appointment cancelled successfully",
            data: {
                refundAmount: cancellationCheck.refundAmount,
                cancellationTime: appointment.cancelledAt
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Manager: Get Appointments ==================
const getAppointments = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { 
            page = 1, 
            limit = 10, 
            status, 
            date, 
            startDate, 
            endDate 
        } = req.query;
        
        // Get manager's business
        const manager = await require("../models/Manager").findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const cacheKey = `manager:${managerId}:appointments:${status}:${date}:${startDate}:${endDate}:${page}:${limit}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }
        
        let query = { business: manager.business._id };
        
        if (status) {
            query.status = status;
        }
        
        if (date) {
            const appointmentDate = new Date(date);
            query.appointmentDate = {
                $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
                $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
            };
        }
        
        if (startDate && endDate) {
            query.appointmentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const appointments = await Appointment.find(query)
            .populate('customer', 'name email phone')
            .populate('staff', 'name role specialization')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ appointmentDate: 1, startTime: 1 });
        
        const total = await Appointment.countDocuments(query);
        
        const response = {
            success: true,
            data: appointments.map(a => a.toObject()),
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

// ================== Manager: Update Appointment Status ==================
const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const { status, notes } = req.body;
        const managerId = req.user.id;
        
        // Get manager's business
        const manager = await require("../models/Manager").findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            business: manager.business._id
        }).populate('customer');
        
        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                message: "Appointment not found" 
            });
        }
        
        // Update appointment
        appointment.status = status;
        
        if (status === 'completed') {
            appointment.completedAt = new Date();
            appointment.completionNotes = notes;
            
            // Update customer stats
            if (appointment.customer) {
                await appointment.customer.updateStats(
                    appointment.finalPrice,
                    appointment.customerRating
                );
            }
        }
        
        await appointment.save();
        
        // Invalidate caches
        await deleteCache(`manager:${managerId}:appointments`);
        await deleteCache(`business:${manager.business._id}:appointments`);
        
        return res.json({
            success: true,
            message: "Appointment status updated successfully",
            data: appointment.toObject()
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getBusinessForBooking,
    getBusinessForBookingById,
    getAvailableSlots,
    getAvailableSlotsById,
    bookAppointment,
    bookAppointmentById,
    getAppointmentByCode,
    cancelAppointment,
    getAppointments,
    updateAppointmentStatus
};
