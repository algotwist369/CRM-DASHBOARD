const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
        staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", index: true },

        // Appointment details
        appointmentDate: { type: Date, required: true, index: true },
        startTime: { type: String, required: true }, // Format: "HH:MM"
        endTime: { type: String, required: true },   // Format: "HH:MM"
        duration: { type: Number, required: true },  // Duration in minutes

        // Service information
        services: [{
            serviceName: { type: String, required: true },
            serviceType: {
                type: String,
                enum: ["hair", "facial", "massage", "nail", "spa", "room", "food", "other"],
                required: true
            },
            serviceCategory: { type: String },
            price: { type: Number, required: true },
            duration: { type: Number, required: true } // Duration in minutes
        }],

        // Pricing
        totalPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        finalPrice: { type: Number, required: true },

        // Appointment status
        status: {
            type: String,
            enum: ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
            default: "pending",
            index: true
        },

        // Booking information
        bookingSource: {
            type: String,
            enum: ["online", "phone", "walk_in", "manager", "staff"],
            default: "online",
            index: true
        },
        bookingNotes: { type: String },

        // Customer preferences for this appointment
        customerNotes: { type: String },
        specialRequests: [{ type: String }],

        // Reminder settings
        reminders: {
            smsSent: { type: Boolean, default: false },
            emailSent: { type: Boolean, default: false },
            whatsappSent: { type: Boolean, default: false },
            reminderDate: { type: Date }
        },

        // Completion information
        completedAt: { type: Date },
        completionNotes: { type: String },
        customerRating: { type: Number, min: 1, max: 5 },
        customerFeedback: { type: String },

        // Cancellation information
        cancelledAt: { type: Date },
        cancellationReason: { type: String },
        cancelledBy: {
            type: String,
            enum: ["customer", "staff", "manager", "system"]
        },

        // Rescheduling information
        rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
        rescheduledTo: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
        rescheduleCount: { type: Number, default: 0 },

        // Payment information
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "partial", "refunded"],
            default: "pending"
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "card", "upi", "wallet", "online", "other"]
        },
        advancePayment: { type: Number, default: 0 },

        // Confirmation
        confirmationCode: { type: String, unique: true },
        isConfirmed: { type: Boolean, default: false },
        confirmedAt: { type: Date },
        confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" }
    },
    { timestamps: true }
);

// Indexes
appointmentSchema.index({ business: 1, appointmentDate: 1 });
appointmentSchema.index({ business: 1, status: 1 });
appointmentSchema.index({ customer: 1, appointmentDate: 1 });
appointmentSchema.index({ staff: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, startTime: 1 });
// appointmentSchema.index({ confirmationCode: 1 }); // Already indexed in schema

// Generate confirmation code before saving
appointmentSchema.pre('save', function (next) {
    if (!this.confirmationCode) {
        const businessId = this.business.toString().slice(-4);
        const date = this.appointmentDate.toISOString().slice(2, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.confirmationCode = `${businessId}${date}${random}`.toUpperCase();
    }
    next();
});

// Calculate final price before saving
appointmentSchema.pre('save', function (next) {
    this.finalPrice = this.totalPrice - this.discount + this.tax;
    next();
});

// Virtual for appointment duration in hours
appointmentSchema.virtual('durationInHours').get(function () {
    return this.duration / 60;
});

// Virtual for appointment status display
appointmentSchema.virtual('statusDisplay').get(function () {
    const statusMap = {
        'pending': 'Pending Confirmation',
        'confirmed': 'Confirmed',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'no_show': 'No Show'
    };
    return statusMap[this.status] || this.status;
});

// Method to check if appointment is in the past
appointmentSchema.methods.isPast = function () {
    const now = new Date();
    const appointmentDateTime = new Date(`${this.appointmentDate.toISOString().split('T')[0]}T${this.startTime}:00`);
    return appointmentDateTime < now;
};

// Method to check if appointment is today
appointmentSchema.methods.isToday = function () {
    const today = new Date().toISOString().split('T')[0];
    const appointmentDate = this.appointmentDate.toISOString().split('T')[0];
    return appointmentDate === today;
};

// Method to check if appointment is upcoming (within next 24 hours)
appointmentSchema.methods.isUpcoming = function () {
    const now = new Date();
    const appointmentDateTime = new Date(`${this.appointmentDate.toISOString().split('T')[0]}T${this.startTime}:00`);
    const timeDiff = appointmentDateTime - now;
    return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // Within 24 hours
};

module.exports = mongoose.model("Appointment", appointmentSchema);
