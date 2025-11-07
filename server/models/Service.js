// Service.js - Service/Product catalog model
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        // Business Reference
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
            index: true
        },
        
        // Basic Information
        name: { 
            type: String, 
            required: true, 
            trim: true,
            index: true 
        },
        description: { type: String },
        shortDescription: { type: String, maxlength: 200 },
        
        // Category & Classification
        category: { 
            type: String, 
            required: true,
            index: true 
        },
        subCategory: { type: String },
        tags: [{ type: String }],
        
        // Pricing
        price: { 
            type: Number, 
            required: true,
            min: 0 
        },
        originalPrice: { type: Number, min: 0 }, // For showing discounts
        currency: { type: String, default: "INR" },
        
        // Pricing Options
        pricingType: {
            type: String,
            enum: ["fixed", "variable", "package", "membership"],
            default: "fixed"
        },
        pricingOptions: [{
            name: { type: String },
            price: { type: Number },
            duration: { type: Number } // in minutes
        }],
        
        // Service Type
        serviceType: {
            type: String,
            enum: ["service", "product", "package", "membership"],
            default: "service"
        },
        
        // Duration (for services)
        duration: { 
            type: Number, // in minutes
            default: 30 
        },
        bufferTime: { type: Number, default: 0 }, // Minutes buffer after service
        
        // Availability
        isActive: { type: Boolean, default: true, index: true },
        isAvailableOnline: { type: Boolean, default: true },
        availableDays: [{
            type: String,
            enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        }],
        availableTimeSlots: [{
            start: { type: String },
            end: { type: String }
        }],
        
        // Staff Requirements
        requiresStaff: { type: Boolean, default: true },
        minStaffRequired: { type: Number, default: 1 },
        assignedStaff: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Staff" 
        }],
        
        // Commission
        staffCommission: {
            type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
            value: { type: Number, default: 0 }
        },
        
        // Images & Media
        images: [{ type: String }],
        thumbnail: { type: String },
        videoUrl: { type: String },
        
        // Inventory (for products)
        inventory: {
            trackInventory: { type: Boolean, default: false },
            currentStock: { type: Number, default: 0 },
            lowStockThreshold: { type: Number, default: 5 },
            maxStock: { type: Number },
            unit: { type: String } // e.g., "pieces", "kg", "liters"
        },
        
        // Package Details (if serviceType is package)
        packageDetails: {
            includedServices: [{
                service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
                quantity: { type: Number, default: 1 }
            }],
            validity: { type: Number }, // Days
            totalSessions: { type: Number }
        },
        
        // Membership Details (if serviceType is membership)
        membershipDetails: {
            validityDays: { type: Number },
            benefits: [{ type: String }],
            includedServices: [{
                service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
                sessionsPerMonth: { type: Number }
            }],
            discountPercentage: { type: Number, default: 0 }
        },
        
        // Requirements & Restrictions
        ageRestriction: {
            minAge: { type: Number },
            maxAge: { type: Number }
        },
        genderRestriction: {
            type: String,
            enum: ["any", "male", "female"]
        },
        prerequisites: [{ type: String }], // e.g., "Must have membership"
        
        // Booking Settings
        allowOnlineBooking: { type: Boolean, default: true },
        advanceBookingDays: { type: Number, default: 30 },
        minBookingNotice: { type: Number, default: 0 }, // Hours
        maxBookingsPerDay: { type: Number },
        
        // Cancellation Policy
        cancellationPolicy: {
            allowed: { type: Boolean, default: true },
            hoursBeforeService: { type: Number, default: 24 },
            cancellationFee: { type: Number, default: 0 }
        },
        
        // Special Features
        features: [{ type: String }],
        benefits: [{ type: String }],
        instructions: { type: String }, // Pre/Post service instructions
        
        // SEO & Marketing
        seo: {
            metaTitle: { type: String },
            metaDescription: { type: String },
            keywords: [{ type: String }]
        },
        
        // Promotion
        isPromoted: { type: Boolean, default: false },
        promotionText: { type: String },
        
        // Ratings & Reviews
        ratings: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0 }
        },
        
        // Statistics
        stats: {
            totalBookings: { type: Number, default: 0 },
            totalRevenue: { type: Number, default: 0 },
            popularity: { type: Number, default: 0 } // Can be calculated
        },
        
        // Display Order
        displayOrder: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        
        // Custom Fields
        customFields: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        },
        
        // Metadata
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'createdByModel'
        },
        createdByModel: {
            type: String,
            enum: ['Admin', 'Manager']
        },
        updatedBy: { 
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'updatedByModel'
        },
        updatedByModel: {
            type: String,
            enum: ['Admin', 'Manager']
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for better performance
serviceSchema.index({ business: 1, isActive: 1 });
serviceSchema.index({ business: 1, category: 1 });
serviceSchema.index({ business: 1, serviceType: 1 });
serviceSchema.index({ business: 1, price: 1 });
serviceSchema.index({ business: 1, 'ratings.average': -1 });
serviceSchema.index({ business: 1, displayOrder: 1 });
serviceSchema.index({ tags: 1 });

// Virtual for discount percentage
serviceSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
    return `${this.currency} ${this.price.toFixed(2)}`;
});

// Virtual for low stock status
serviceSchema.virtual('isLowStock').get(function() {
    if (this.inventory.trackInventory) {
        return this.inventory.currentStock <= this.inventory.lowStockThreshold;
    }
    return false;
});

// Method to update service stats
serviceSchema.methods.updateStats = async function(bookingAmount) {
    this.stats.totalBookings += 1;
    this.stats.totalRevenue += bookingAmount;
    this.stats.popularity = this.stats.totalBookings; // Simple popularity metric
    await this.save();
};

// Method to update rating
serviceSchema.methods.updateRating = async function(newRating) {
    const totalRating = (this.ratings.average * this.ratings.count) + newRating;
    this.ratings.count += 1;
    this.ratings.average = totalRating / this.ratings.count;
    await this.save();
};

// Method to check if service is available on a given date/time
serviceSchema.methods.isAvailableAt = function(date, time) {
    // Check if service is active
    if (!this.isActive) return false;
    
    // Check if day is available
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    if (this.availableDays.length > 0 && !this.availableDays.includes(dayName)) {
        return false;
    }
    
    // Check if time slot is available
    if (this.availableTimeSlots.length > 0) {
        return this.availableTimeSlots.some(slot => {
            return time >= slot.start && time <= slot.end;
        });
    }
    
    return true;
};

// Method to reduce inventory
serviceSchema.methods.reduceInventory = async function(quantity = 1) {
    if (this.inventory.trackInventory) {
        if (this.inventory.currentStock >= quantity) {
            this.inventory.currentStock -= quantity;
            await this.save();
            return true;
        }
        return false; // Insufficient stock
    }
    return true; // Inventory not tracked
};

// Method to add inventory
serviceSchema.methods.addInventory = async function(quantity = 1) {
    if (this.inventory.trackInventory) {
        this.inventory.currentStock += quantity;
        if (this.inventory.maxStock && this.inventory.currentStock > this.inventory.maxStock) {
            this.inventory.currentStock = this.inventory.maxStock;
        }
        await this.save();
    }
};

// Static method to get popular services
serviceSchema.statics.getPopularServices = async function(businessId, limit = 10) {
    return await this.find({ 
        business: businessId, 
        isActive: true 
    })
    .sort({ 'stats.popularity': -1 })
    .limit(limit);
};

// Static method to get featured services
serviceSchema.statics.getFeaturedServices = async function(businessId) {
    return await this.find({ 
        business: businessId, 
        isActive: true,
        isFeatured: true 
    })
    .sort({ displayOrder: 1 });
};

module.exports = mongoose.model("Service", serviceSchema);

