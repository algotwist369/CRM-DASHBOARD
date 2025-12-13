const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
    {
        business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: "Manager", required: true, index: true },
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },

        // Login credentials
        username: { type: String, unique: true, sparse: true }, // Optional, for login
        pin: { type: String }, // 4-digit PIN for login
        password: { type: String }, // Optional password for login
        address: { type: String },
        role: {
            type: String,
            enum: ["stylist", "therapist", "receptionist", "cleaner", "assistant", "other"],
            default: "stylist",
            index: true
        },
        specialization: { type: String }, // e.g., "Hair cutting", "Facial treatment", "Massage"
        experience: { type: Number, default: 0 }, // years of experience
        salary: { type: Number },
        commission: { type: Number, default: 0 }, // percentage
        isActive: { type: Boolean, default: true },
        joiningDate: { type: Date, default: Date.now },
        workingHours: {
            start: { type: String, default: "09:00" },
            end: { type: String, default: "18:00" },
            days: [{ type: String, enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] }]
        },

        // === PHASE 1 ENHANCEMENT: Attendance Tracking ===
        attendance: {
            totalWorkingDays: { type: Number, default: 0 },
            presentDays: { type: Number, default: 0 },
            absentDays: { type: Number, default: 0 },
            lateDays: { type: Number, default: 0 },
            halfDays: { type: Number, default: 0 },
            leaves: [{
                startDate: Date,
                endDate: Date,
                type: { type: String, enum: ["sick", "casual", "earned", "unpaid"] },
                status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
                reason: String,
                approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" },
                approvalDate: Date
            }]
        },

        // Performance tracking (Original - PRESERVED + Enhanced)
        performance: {
            totalCustomers: { type: Number, default: 0 },
            totalRevenue: { type: Number, default: 0 },
            rating: { type: Number, default: 0, min: 0, max: 5 },
            reviews: { type: Number, default: 0 },

            // === PHASE 1 ENHANCEMENT: Additional Performance Metrics ===
            totalAppointments: { type: Number, default: 0 },
            completedAppointments: { type: Number, default: 0 },
            cancelledByStaff: { type: Number, default: 0 },
            averageRating: { type: Number, default: 0, min: 0, max: 5 },
            totalReviews: { type: Number, default: 0 },
            totalCommissionEarned: { type: Number, default: 0 },
            avgServiceTime: { type: Number, default: 0 },  // in minutes
            customerRetentionRate: { type: Number, default: 0 }  // %
        },

        // === PHASE 1 ENHANCEMENT: Targets for Performance Incentives ===
        monthlyTarget: {
            revenue: { type: Number, default: 0 },
            appointments: { type: Number, default: 0 },
            rating: { type: Number, default: 4.5 },
            customerSatisfaction: { type: Number, default: 90 }  // %
        },

        // === PHASE 1 ENHANCEMENT: Additional Info ===
        emergencyContact: {
            name: String,
            phone: String,
            relationship: String
        },

        documents: [{
            type: { type: String, enum: ["aadhar", "pan", "resume", "certificate", "other"] },
            url: String,
            uploadedAt: Date
        }],

        notes: { type: String }
    },
    { timestamps: true }
);

// Indexes (Original - PRESERVED)
staffSchema.index({ business: 1, isActive: 1 });
staffSchema.index({ manager: 1, role: 1 });
staffSchema.index({ phone: 1 });

// === PHASE 1 ENHANCEMENT: Additional Indexes ===
staffSchema.index({ business: 1, role: 1, isActive: 1 });
staffSchema.index({ 'performance.totalRevenue': -1 });

module.exports = mongoose.model("Staff", staffSchema);

