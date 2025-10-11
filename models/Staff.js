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
        
        // Performance tracking
        performance: {
            totalCustomers: { type: Number, default: 0 },
            totalRevenue: { type: Number, default: 0 },
            rating: { type: Number, default: 0, min: 0, max: 5 },
            reviews: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

// Indexes
staffSchema.index({ business: 1, isActive: 1 });
staffSchema.index({ manager: 1, role: 1 });
staffSchema.index({ phone: 1 });

module.exports = mongoose.model("Staff", staffSchema);
