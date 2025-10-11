// appointmentUtils.js - Appointment booking utility functions

/**
 * Generate available time slots for a given date
 * @param {Object} business - Business object with settings
 * @param {Date} date - Date to generate slots for
 * @param {Array} existingAppointments - Existing appointments for the date
 * @param {string} staffId - Optional staff ID to filter slots
 * @returns {Array} - Array of available time slots
 */
const generateAvailableSlots = (business, date, existingAppointments = [], staffId = null) => {
    const settings = business.settings.appointmentSettings;
    const workingHours = business.settings.workingHours;
    
    // Check if business is open on this day
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (!workingHours.days.includes(dayName)) {
        return [];
    }
    
    const slots = [];
    const startTime = workingHours.open;
    const endTime = workingHours.close;
    const slotDuration = settings.slotDuration;
    const bufferTime = settings.bufferTime;
    
    // Convert time strings to minutes
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };
    
    const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    // Generate slots
    for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += slotDuration) {
        const slotStartTime = minutesToTime(currentMinutes);
        const slotEndTime = minutesToTime(currentMinutes + slotDuration);
        
        // Check if slot is available
        const isAvailable = !existingAppointments.some(appointment => {
            if (staffId && appointment.staff && appointment.staff.toString() !== staffId) {
                return false; // Different staff, slot is available
            }
            
            const appointmentStart = timeToMinutes(appointment.startTime);
            const appointmentEnd = timeToMinutes(appointment.endTime);
            
            // Check for overlap (including buffer time)
            return (currentMinutes < appointmentEnd + bufferTime) && 
                   (currentMinutes + slotDuration > appointmentStart - bufferTime);
        });
        
        if (isAvailable) {
            slots.push({
                startTime: slotStartTime,
                endTime: slotEndTime,
                duration: slotDuration,
                available: true
            });
        }
    }
    
    return slots;
};

/**
 * Validate appointment booking
 * @param {Object} appointmentData - Appointment data to validate
 * @param {Object} business - Business object
 * @param {Array} existingAppointments - Existing appointments
 * @returns {Object} - Validation result
 */
const validateAppointmentBooking = (appointmentData, business, existingAppointments = []) => {
    const errors = [];
    const settings = business.settings.appointmentSettings;
    const workingHours = business.settings.workingHours;
    
    // Check if online booking is allowed
    if (!settings.allowOnlineBooking) {
        errors.push("Online booking is not available for this business");
    }
    
    // Check advance booking limits
    const appointmentDate = new Date(appointmentData.appointmentDate);
    const now = new Date();
    
    // Create appointment datetime by combining date with start time
    const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.startTime}:00`);
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < settings.minAdvanceBookingHours) {
        errors.push(`Appointment must be booked at least ${settings.minAdvanceBookingHours} hours in advance`);
    }
    
    if (hoursUntilAppointment > settings.maxAdvanceBookingHours) {
        errors.push(`Appointment cannot be booked more than ${settings.maxAdvanceBookingHours / 24} days in advance`);
    }
    
    // Check if business is open on the selected day
    const dayName = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (!workingHours.days.includes(dayName)) {
        errors.push("Business is closed on the selected day");
    }
    
    // Check if appointment time is within working hours
    const appointmentStartTime = appointmentData.startTime;
    const appointmentEndTime = appointmentData.endTime;
    
    if (appointmentStartTime < workingHours.open || appointmentEndTime > workingHours.close) {
        errors.push("Appointment time must be within business working hours");
    }
    
    // Check for conflicts with existing appointments
    const hasConflict = existingAppointments.some(appointment => {
        if (appointmentData.staff && appointment.staff && 
            appointment.staff.toString() !== appointmentData.staff) {
            return false; // Different staff, no conflict
        }
        
        const appointmentStart = appointmentData.startTime;
        const appointmentEnd = appointmentData.endTime;
        const existingStart = appointment.startTime;
        const existingEnd = appointment.endTime;
        
        // Check for overlap (including buffer time)
        return (appointmentStart < existingEnd) && (appointmentEnd > existingStart);
    });
    
    if (hasConflict) {
        errors.push("Selected time slot is not available");
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

/**
 * Calculate appointment pricing
 * @param {Array} services - Array of services
 * @param {Object} customer - Customer object (for discounts)
 * @param {Object} business - Business object
 * @returns {Object} - Pricing breakdown
 */
const calculateAppointmentPricing = (services, customer = null, business = null) => {
    let totalPrice = 0;
    let totalDuration = 0;
    
    services.forEach(service => {
        totalPrice += service.price;
        totalDuration += service.duration;
    });
    
    // Apply customer discounts (loyalty, etc.)
    let discount = 0;
    if (customer && customer.stats.loyaltyPoints > 100) {
        discount = Math.min(totalPrice * 0.1, 500); // 10% discount, max 500 rupees
    }
    
    // Calculate tax (assuming 18% GST)
    const tax = (totalPrice - discount) * 0.18;
    
    const finalPrice = totalPrice - discount + tax;
    
    return {
        totalPrice,
        discount,
        tax,
        finalPrice,
        totalDuration,
        breakdown: {
            services: services.map(service => ({
                name: service.serviceName,
                price: service.price,
                duration: service.duration
            })),
            subtotal: totalPrice,
            discount: discount,
            tax: tax,
            total: finalPrice
        }
    };
};

/**
 * Generate appointment confirmation message
 * @param {Object} appointment - Appointment object
 * @param {Object} business - Business object
 * @param {Object} customer - Customer object
 * @returns {string} - Confirmation message
 */
const generateConfirmationMessage = (appointment, business, customer) => {
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-IN');
    const startTime = appointment.startTime;
    const endTime = appointment.endTime;
    
    return `Dear ${customer.name},

Your appointment has been confirmed!

📅 Date: ${appointmentDate}
⏰ Time: ${startTime} - ${endTime}
🏢 Business: ${business.name} - ${business.branch}
📍 Address: ${business.address}
📞 Phone: ${business.phone}

Confirmation Code: ${appointment.confirmationCode}

Please arrive 10 minutes before your appointment time.

Thank you for choosing ${business.name}!`;
};

/**
 * Check if appointment can be cancelled
 * @param {Object} appointment - Appointment object
 * @param {Object} business - Business object
 * @returns {Object} - Cancellation eligibility
 */
const canCancelAppointment = (appointment, business) => {
    const settings = business.settings.appointmentSettings;
    const cancellationPolicy = settings.cancellationPolicy;
    
    if (!cancellationPolicy.allowCancellation) {
        return {
            canCancel: false,
            reason: "Cancellation is not allowed for this business"
        };
    }
    
    const appointmentDate = new Date(appointment.appointmentDate);
    const appointmentTime = new Date(`${appointmentDate.toISOString().split('T')[0]}T${appointment.startTime}:00`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < cancellationPolicy.minCancellationHours) {
        return {
            canCancel: false,
            reason: `Cancellation must be done at least ${cancellationPolicy.minCancellationHours} hours before appointment`
        };
    }
    
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
        return {
            canCancel: false,
            reason: "Appointment is already completed or cancelled"
        };
    }
    
    return {
        canCancel: true,
        refundAmount: appointment.finalPrice * (cancellationPolicy.refundPercentage / 100)
    };
};

/**
 * Format time for display
 * @param {string} time - Time in HH:MM format
 * @returns {string} - Formatted time
 */
const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Get business services by type
 * @param {string} businessType - Type of business (salon, spa, hotel)
 * @returns {Array} - Available services
 */
const getBusinessServices = (businessType) => {
    const services = {
        salon: [
            { name: "Hair Cut", type: "hair", category: "Hair Services", price: 500, duration: 30 },
            { name: "Hair Wash", type: "hair", category: "Hair Services", price: 200, duration: 20 },
            { name: "Hair Color", type: "hair", category: "Hair Services", price: 1500, duration: 120 },
            { name: "Hair Styling", type: "hair", category: "Hair Services", price: 800, duration: 45 },
            { name: "Facial", type: "facial", category: "Skin Care", price: 1000, duration: 60 },
            { name: "Manicure", type: "nail", category: "Nail Care", price: 400, duration: 30 },
            { name: "Pedicure", type: "nail", category: "Nail Care", price: 600, duration: 45 }
        ],
        spa: [
            { name: "Full Body Massage", type: "massage", category: "Massage", price: 2000, duration: 90 },
            { name: "Head & Shoulder Massage", type: "massage", category: "Massage", price: 800, duration: 30 },
            { name: "Foot Massage", type: "massage", category: "Massage", price: 600, duration: 30 },
            { name: "Aromatherapy", type: "spa", category: "Spa Treatments", price: 1500, duration: 60 },
            { name: "Hot Stone Therapy", type: "spa", category: "Spa Treatments", price: 2500, duration: 90 },
            { name: "Facial Treatment", type: "facial", category: "Skin Care", price: 1200, duration: 75 }
        ],
        hotel: [
            { name: "Standard Room", type: "room", category: "Accommodation", price: 3000, duration: 1440 }, // 24 hours
            { name: "Deluxe Room", type: "room", category: "Accommodation", price: 5000, duration: 1440 },
            { name: "Suite", type: "room", category: "Accommodation", price: 8000, duration: 1440 },
            { name: "Room Service", type: "food", category: "Food & Beverage", price: 500, duration: 30 },
            { name: "Spa Package", type: "spa", category: "Wellness", price: 3000, duration: 120 },
            { name: "Airport Transfer", type: "other", category: "Transportation", price: 1000, duration: 60 }
        ]
    };
    
    return services[businessType] || [];
};

module.exports = {
    generateAvailableSlots,
    validateAppointmentBooking,
    calculateAppointmentPricing,
    generateConfirmationMessage,
    canCancelAppointment,
    formatTime,
    getBusinessServices
};
