const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        
        // Customer information
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        dateOfBirth: { type: Date },
        gender: { type: String, enum: ["male", "female", "other"] },
        
        // Address information
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
            country: { type: String, default: "India" }
        },
        
        // Customer preferences
        preferences: {
            preferredServices: [{ type: String }],
            preferredStaff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
            preferredTimeSlots: [{ type: String }], // e.g., ["morning", "afternoon", "evening"]
            notes: { type: String }
        },
        
        // Customer statistics
        stats: {
            totalVisits: { type: Number, default: 0 },
            totalSpent: { type: Number, default: 0 },
            lastVisit: { type: Date },
            averageRating: { type: Number, default: 0, min: 0, max: 5 },
            loyaltyPoints: { type: Number, default: 0 }
        },
        
        // Communication preferences
        communication: {
            smsNotifications: { type: Boolean, default: true },
            emailNotifications: { type: Boolean, default: true },
            whatsappNotifications: { type: Boolean, default: false }
        },
        
        // Customer status
        status: { 
            type: String, 
            enum: ["active", "inactive", "blocked"], 
            default: "active" 
        },
        
        // Emergency contact
        emergencyContact: {
            name: { type: String },
            phone: { type: String },
            relationship: { type: String }
        },
        
        // Medical information (for spa/hotel services)
        medicalInfo: {
            allergies: [{ type: String }],
            medicalConditions: [{ type: String }],
            medications: [{ type: String }],
            notes: { type: String }
        }
    },
    { timestamps: true }
);

// Indexes
customerSchema.index({ business: 1, email: 1 });
customerSchema.index({ business: 1, phone: 1 });
customerSchema.index({ business: 1, status: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
    const addr = this.address;
    if (!addr) return '';
    return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
});

// Method to update customer stats
customerSchema.methods.updateStats = function(amount, rating) {
    this.stats.totalVisits += 1;
    this.stats.totalSpent += amount;
    this.stats.lastVisit = new Date();
    
    if (rating) {
        const currentRating = this.stats.averageRating;
        const totalVisits = this.stats.totalVisits;
        this.stats.averageRating = ((currentRating * (totalVisits - 1)) + rating) / totalVisits;
    }
    
    // Calculate loyalty points (1 point per 100 rupees spent)
    this.stats.loyaltyPoints = Math.floor(this.stats.totalSpent / 100);
    
    return this.save();
};

module.exports = mongoose.model("Customer", customerSchema);
