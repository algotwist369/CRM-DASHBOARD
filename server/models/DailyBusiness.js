const mongoose = require("mongoose");

const dailyBusinessSchema = new mongoose.Schema(
    {
        business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: "Manager", required: true, index: true },
        date: { type: Date, default: Date.now, index: true },
        businessType: { type: String, enum: ["salon", "spa", "hotel"], required: true },

        // Daily summary
        totalCustomers: { type: Number, default: 0 },
        totalIncome: { type: Number, default: 0 },
        totalExpenses: { type: Number, default: 0 },
        netProfit: { type: Number, default: 0 },

        // Service-wise breakdown
        services: [{
            serviceName: { type: String, required: true },
            serviceType: { type: String, enum: ["hair", "facial", "massage", "nail", "spa", "room", "food", "other"] },
            customerCount: { type: Number, default: 0 },
            totalRevenue: { type: Number, default: 0 },
            averagePrice: { type: Number, default: 0 }
        }],

        // Staff performance
        staffPerformance: [{
            staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
            customersServed: { type: Number, default: 0 },
            revenue: { type: Number, default: 0 },
            commission: { type: Number, default: 0 }
        }],

        // Additional metrics
        metrics: {
            walkInCustomers: { type: Number, default: 0 },
            appointmentCustomers: { type: Number, default: 0 },
            repeatCustomers: { type: Number, default: 0 },
            newCustomers: { type: Number, default: 0 },
            averageServiceTime: { type: Number, default: 0 }, // in minutes
            customerSatisfaction: { type: Number, default: 0, min: 0, max: 5 }
        },

        // Notes and observations
        notes: { type: String },
        weather: { type: String }, // For business correlation
        specialEvents: [{ type: String }], // Festivals, holidays, etc.

        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date }
    },
    { timestamps: true }
);

// Compound indexes
dailyBusinessSchema.index({ business: 1, date: -1 });
dailyBusinessSchema.index({ manager: 1, date: -1 });
dailyBusinessSchema.index({ businessType: 1, date: -1 });
dailyBusinessSchema.index({ date: -1, isCompleted: 1 });

// Calculate net profit before saving
dailyBusinessSchema.pre('save', function(next) {
    this.netProfit = this.totalIncome - this.totalExpenses;
    next();
});

module.exports = mongoose.model("DailyBusiness", dailyBusinessSchema);
