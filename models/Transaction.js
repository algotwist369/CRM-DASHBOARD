const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: "Manager", required: true, index: true },
        staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" }, // Staff who performed the service
        
        // Customer information
        customerName: { type: String, required: true },
        customerPhone: { type: String },
        customerEmail: { type: String },
        isNewCustomer: { type: Boolean, default: true },
        
        // Service details
        serviceName: { type: String, required: true },
        serviceType: { 
            type: String, 
            enum: ["hair", "facial", "massage", "nail", "spa", "room", "food", "other"],
            required: true 
        },
        serviceCategory: { type: String }, // e.g., "Hair Cut", "Facial Treatment"
        
        // Pricing
        basePrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        finalPrice: { type: Number, required: true },
        
        // Payment details
        paymentMethod: { 
            type: String, 
            enum: ["cash", "card", "upi", "wallet", "other"], 
            default: "cash" 
        },
        paymentStatus: { 
            type: String, 
            enum: ["pending", "completed", "refunded"], 
            default: "completed" 
        },
        
        // Service timing
        serviceStartTime: { type: Date },
        serviceEndTime: { type: Date },
        duration: { type: Number }, // in minutes
        
        // Additional details
        notes: { type: String },
        rating: { type: Number, min: 1, max: 5 },
        feedback: { type: String },
        
        // Commission tracking
        staffCommission: { type: Number, default: 0 },
        
        // Date and time
        transactionDate: { type: Date, default: Date.now, index: true },
        isRefunded: { type: Boolean, default: false },
        refundDate: { type: Date },
        refundReason: { type: String }
    },
    { timestamps: true }
);

// Compound indexes
transactionSchema.index({ business: 1, transactionDate: -1 });
transactionSchema.index({ manager: 1, transactionDate: -1 });
transactionSchema.index({ staff: 1, transactionDate: -1 });
transactionSchema.index({ customerPhone: 1 });
transactionSchema.index({ serviceType: 1, transactionDate: -1 });
transactionSchema.index({ paymentStatus: 1 });

// Calculate final price before saving
transactionSchema.pre('save', function(next) {
    this.finalPrice = this.basePrice - this.discount + this.tax;
    next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
