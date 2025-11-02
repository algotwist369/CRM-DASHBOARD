const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema(
    {
        business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true, index: true },
        pin: { type: String, required: true }, // 4-digit PIN for login
        email: { type: String },
        phone: { type: String },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date },
        
        // Manager permissions
        permissions: {
            canManageStaff: { type: Boolean, default: true },
            canViewReports: { type: Boolean, default: true },
            canManageDailyBusiness: { type: Boolean, default: true },
            canManageTransactions: { type: Boolean, default: true }
        },

        staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],
    },
    { timestamps: true }
);

// Index for business-specific manager lookup
managerSchema.index({ business: 1, username: 1 });
managerSchema.index({ business: 1, isActive: 1 }); // Critical for dashboard queries

module.exports = mongoose.model("Manager", managerSchema);
