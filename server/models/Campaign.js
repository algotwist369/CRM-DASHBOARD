const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
    {
        business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Manager", required: true, index: true },
        
        // Campaign details
        name: { type: String, required: true },
        description: { type: String },
        type: { 
            type: String, 
            enum: ["promotional", "seasonal", "loyalty", "win_back", "announcement", "event"],
            required: true,
            index: true
        },
        
        // Campaign settings
        settings: {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            isActive: { type: Boolean, default: true },
            autoSend: { type: Boolean, default: false },
            frequency: { 
                type: String, 
                enum: ["once", "daily", "weekly", "monthly"],
                default: "once"
            },
            maxSends: { type: Number, default: 1 }
        },
        
        // Target audience
        targetAudience: {
            segments: [{
                name: { type: String, required: true },
                criteria: {
                    customerType: { 
                        type: String, 
                        enum: ["all", "new", "returning", "loyalty", "inactive", "high_value"],
                        default: "all"
                    },
                    minVisits: { type: Number },
                    maxVisits: { type: Number },
                    minSpent: { type: Number },
                    maxSpent: { type: Number },
                    lastVisitDays: { type: Number },
                    preferredServices: [{ type: String }],
                    ageRange: {
                        min: { type: Number },
                        max: { type: Number }
                    },
                    gender: [{ type: String, enum: ["male", "female", "other"] }],
                    location: {
                        city: { type: String },
                        state: { type: String },
                        pincode: { type: String }
                    }
                },
                estimatedSize: { type: Number }
            }]
        },
        
        // Campaign content
        content: {
            templates: [{
                channel: { type: String, enum: ["sms", "email", "whatsapp", "push"] },
                subject: { type: String },
                title: { type: String },
                message: { type: String, required: true },
                imageUrl: { type: String },
                actionUrl: { type: String },
                actionText: { type: String }
            }],
            offer: {
                type: { 
                    type: String, 
                    enum: ["percentage", "fixed_amount", "free_service", "buy_one_get_one"],
                    default: "percentage"
                },
                value: { type: Number },
                minPurchase: { type: Number },
                maxDiscount: { type: Number },
                validUntil: { type: Date },
                terms: { type: String }
            }
        },
        
        // Campaign status
        status: { 
            type: String, 
            enum: ["draft", "scheduled", "running", "paused", "completed", "cancelled"],
            default: "draft",
            index: true
        },
        
        // Performance tracking
        performance: {
            totalSent: { type: Number, default: 0 },
            totalDelivered: { type: Number, default: 0 },
            totalOpened: { type: Number, default: 0 },
            totalClicked: { type: Number, default: 0 },
            totalConversions: { type: Number, default: 0 },
            totalRevenue: { type: Number, default: 0 },
            cost: { type: Number, default: 0 },
            roi: { type: Number, default: 0 }
        },
        
        // Notifications in this campaign
        notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
        
        // Analytics
        analytics: {
            openRate: { type: Number, default: 0 },
            clickRate: { type: Number, default: 0 },
            conversionRate: { type: Number, default: 0 },
            revenuePerCustomer: { type: Number, default: 0 },
            costPerAcquisition: { type: Number, default: 0 }
        },
        
        // A/B Testing
        abTesting: {
            enabled: { type: Boolean, default: false },
            variants: [{
                name: { type: String },
                content: {
                    subject: { type: String },
                    message: { type: String },
                    imageUrl: { type: String }
                },
                percentage: { type: Number, default: 50 },
                performance: {
                    sent: { type: Number, default: 0 },
                    opened: { type: Number, default: 0 },
                    clicked: { type: Number, default: 0 },
                    converted: { type: Number, default: 0 }
                }
            }]
        },
        
        // Tags and categorization
        tags: [{ type: String }],
        category: { type: String },
        priority: { 
            type: String, 
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        }
    },
    { timestamps: true }
);

// Indexes
campaignSchema.index({ business: 1, status: 1 });
campaignSchema.index({ business: 1, type: 1 });
campaignSchema.index({ business: 1, createdAt: -1 });
campaignSchema.index({ "settings.startDate": 1, "settings.endDate": 1 });
campaignSchema.index({ tags: 1 });

// Virtual for campaign duration
campaignSchema.virtual('duration').get(function() {
    const start = new Date(this.settings.startDate);
    const end = new Date(this.settings.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for campaign performance score
campaignSchema.virtual('performanceScore').get(function() {
    const { totalSent, totalOpened, totalClicked, totalConversions } = this.performance;
    
    if (totalSent === 0) return 0;
    
    const openRate = (totalOpened / totalSent) * 100;
    const clickRate = (totalClicked / totalSent) * 100;
    const conversionRate = (totalConversions / totalSent) * 100;
    
    // Weighted score: 30% open rate, 40% click rate, 30% conversion rate
    return (openRate * 0.3) + (clickRate * 0.4) + (conversionRate * 0.3);
});

// Method to update campaign performance
campaignSchema.methods.updatePerformance = function() {
    const notifications = this.notifications;
    
    if (notifications.length === 0) return this.save();
    
    // Aggregate performance from all notifications
    this.performance.totalSent = notifications.reduce((sum, n) => sum + (n.stats?.sent || 0), 0);
    this.performance.totalDelivered = notifications.reduce((sum, n) => sum + (n.stats?.delivered || 0), 0);
    this.performance.totalOpened = notifications.reduce((sum, n) => sum + (n.stats?.opened || 0), 0);
    this.performance.totalClicked = notifications.reduce((sum, n) => sum + (n.stats?.clicked || 0), 0);
    this.performance.totalConversions = notifications.reduce((sum, n) => sum + (n.analytics?.newBookings || 0), 0);
    this.performance.totalRevenue = notifications.reduce((sum, n) => sum + (n.analytics?.revenue || 0), 0);
    
    // Calculate rates
    this.analytics.openRate = this.performance.totalSent > 0 ? 
        (this.performance.totalDelivered / this.performance.totalSent) * 100 : 0;
    this.analytics.clickRate = this.performance.totalDelivered > 0 ? 
        (this.performance.totalClicked / this.performance.totalDelivered) * 100 : 0;
    this.analytics.conversionRate = this.performance.totalDelivered > 0 ? 
        (this.performance.totalConversions / this.performance.totalDelivered) * 100 : 0;
    
    // Calculate ROI
    this.performance.roi = this.performance.cost > 0 ? 
        ((this.performance.totalRevenue - this.performance.cost) / this.performance.cost) * 100 : 0;
    
    return this.save();
};

// Method to check if campaign is active
campaignSchema.methods.isActive = function() {
    const now = new Date();
    return this.settings.isActive && 
           this.status === 'running' &&
           now >= this.settings.startDate && 
           now <= this.settings.endDate;
};

// Method to get target customer count
campaignSchema.methods.getTargetCount = async function() {
    const Customer = require('./Customer');
    
    let totalCount = 0;
    
    for (const segment of this.targetAudience.segments) {
        let query = { business: this.business };
        
        const criteria = segment.criteria;
        
        // Apply criteria filters
        if (criteria.minVisits) query['stats.totalVisits'] = { $gte: criteria.minVisits };
        if (criteria.maxVisits) query['stats.totalVisits'] = { ...query['stats.totalVisits'], $lte: criteria.maxVisits };
        if (criteria.minSpent) query['stats.totalSpent'] = { $gte: criteria.minSpent };
        if (criteria.maxSpent) query['stats.totalSpent'] = { ...query['stats.totalSpent'], $lte: criteria.maxSpent };
        if (criteria.lastVisitDays) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - criteria.lastVisitDays);
            query['stats.lastVisit'] = { $gte: cutoffDate };
        }
        if (criteria.preferredServices?.length) {
            query['preferences.preferredServices'] = { $in: criteria.preferredServices };
        }
        if (criteria.gender?.length) {
            query.gender = { $in: criteria.gender };
        }
        if (criteria.location?.city) query['address.city'] = criteria.location.city;
        if (criteria.location?.state) query['address.state'] = criteria.location.state;
        if (criteria.location?.pincode) query['address.pincode'] = criteria.location.pincode;
        
        const count = await Customer.countDocuments(query);
        totalCount += count;
    }
    
    return totalCount;
};

module.exports = mongoose.model("Campaign", campaignSchema);
