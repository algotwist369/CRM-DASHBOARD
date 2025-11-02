const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
    {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
        type: { type: String, enum: ["salon", "spa", "hotel"], required: true, index: true },
        name: { type: String, required: true, index: true },
        branch: { type: String, required: true, index: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true, default: "India" },
        phone: { type: String },
        email: { type: String },
        website: { type: String },
        description: { type: String },
        businessLink: { type: String, unique: true }, // Generated link for managers
        isActive: { type: Boolean, default: true },
        
        // Business-specific settings
        settings: {
            workingHours: {
                open: { type: String, default: "09:00" },
                close: { type: String, default: "18:00" },
                days: [{ type: String, enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] }]
            },
            currency: { type: String, default: "INR" },
            timezone: { type: String, default: "Asia/Kolkata" },
            
            // Appointment settings
            appointmentSettings: {
                advanceBookingDays: { type: Number, default: 30 }, // How many days in advance can book
                minAdvanceBookingHours: { type: Number, default: 2 }, // Minimum hours before appointment
                maxAdvanceBookingHours: { type: Number, default: 24 * 30 }, // Maximum hours in advance
                slotDuration: { type: Number, default: 30 }, // Default slot duration in minutes
                bufferTime: { type: Number, default: 15 }, // Buffer time between appointments
                allowOnlineBooking: { type: Boolean, default: true },
                requireAdvancePayment: { type: Boolean, default: false },
                advancePaymentPercentage: { type: Number, default: 0 },
                cancellationPolicy: {
                    allowCancellation: { type: Boolean, default: true },
                    minCancellationHours: { type: Number, default: 2 },
                    refundPercentage: { type: Number, default: 100 }
                },
                reminderSettings: {
                    sendSMSReminder: { type: Boolean, default: true },
                    sendEmailReminder: { type: Boolean, default: true },
                    sendWhatsappReminder: { type: Boolean, default: false },
                    reminderHours: { type: Number, default: 24 } // Hours before appointment
                }
            }
        },

        managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Manager" }],
        staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],
    },
    { timestamps: true }
);

// Compound indexes
businessSchema.index({ type: 1, branch: 1 });
businessSchema.index({ admin: 1, type: 1 });
businessSchema.index({ admin: 1, isActive: 1 }); // Critical for dashboard queries

// Generate business link before saving
businessSchema.pre('save', async function(next) {
    if (!this.businessLink) {
        const admin = await mongoose.model('Admin').findById(this.admin);
        if (admin) {
            const cleanCompanyName = admin.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
            // Extract last 3 digits from businessId for shorter link
            const shortId = this._id.toString().slice(-3);
            this.businessLink = `${cleanCompanyName}_${shortId}`;
        }
    }
    next();
});

module.exports = mongoose.model("Business", businessSchema);
