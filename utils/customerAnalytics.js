// customerAnalytics.js - Customer analytics and segmentation utilities

const Customer = require("../models/Customer");
const Appointment = require("../models/Appointment");
const Transaction = require("../models/Transaction");

/**
 * Get customer analytics for a business
 * @param {string} businessId - Business ID
 * @param {Object} filters - Date range and other filters
 * @returns {Object} - Customer analytics data
 */
const getCustomerAnalytics = async (businessId, filters = {}) => {
    const { startDate, endDate } = filters;
    
    // Base query
    let baseQuery = { business: businessId };
    
    // Date filters
    if (startDate && endDate) {
        baseQuery.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    
    // Get total customers
    const totalCustomers = await Customer.countDocuments(baseQuery);
    
    // Get customer segments
    const segments = await getCustomerSegments(businessId);
    
    // Get customer lifecycle data
    const lifecycleData = await getCustomerLifecycleData(businessId, filters);
    
    // Get customer value analysis
    const valueAnalysis = await getCustomerValueAnalysis(businessId, filters);
    
    // Get customer retention data
    const retentionData = await getCustomerRetentionData(businessId, filters);
    
    // Get customer preferences
    const preferences = await getCustomerPreferences(businessId);
    
    // Get customer growth over time
    const growthData = await getCustomerGrowthData(businessId, filters);
    
    return {
        overview: {
            totalCustomers,
            newCustomers: segments.new,
            returningCustomers: segments.returning,
            loyalCustomers: segments.loyal,
            inactiveCustomers: segments.inactive
        },
        segments,
        lifecycle: lifecycleData,
        value: valueAnalysis,
        retention: retentionData,
        preferences,
        growth: growthData
    };
};

/**
 * Get customer segments
 * @param {string} businessId - Business ID
 * @returns {Object} - Customer segments
 */
const getCustomerSegments = async (businessId) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    const segments = {
        new: await Customer.countDocuments({
            business: businessId,
            'stats.totalVisits': 1
        }),
        returning: await Customer.countDocuments({
            business: businessId,
            'stats.totalVisits': { $gte: 2, $lte: 4 }
        }),
        loyal: await Customer.countDocuments({
            business: businessId,
            'stats.totalVisits': { $gte: 5 }
        }),
        inactive: await Customer.countDocuments({
            business: businessId,
            'stats.lastVisit': { $lt: ninetyDaysAgo }
        }),
        highValue: await Customer.countDocuments({
            business: businessId,
            'stats.totalSpent': { $gte: 5000 }
        }),
        recent: await Customer.countDocuments({
            business: businessId,
            'stats.lastVisit': { $gte: thirtyDaysAgo }
        })
    };
    
    return segments;
};

/**
 * Get customer lifecycle data
 * @param {string} businessId - Business ID
 * @param {Object} filters - Date filters
 * @returns {Object} - Lifecycle data
 */
const getCustomerLifecycleData = async (businessId, filters = {}) => {
    const { startDate, endDate } = filters;
    
    let matchQuery = { business: businessId };
    if (startDate && endDate) {
        matchQuery.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    
    const lifecycleData = await Customer.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                avgFirstVisit: { $avg: '$stats.totalVisits' },
                avgTotalSpent: { $avg: '$stats.totalSpent' },
                avgLoyaltyPoints: { $avg: '$stats.loyaltyPoints' },
                avgRating: { $avg: '$stats.averageRating' },
                totalRevenue: { $sum: '$stats.totalSpent' }
            }
        }
    ]);
    
    return lifecycleData[0] || {
        avgFirstVisit: 0,
        avgTotalSpent: 0,
        avgLoyaltyPoints: 0,
        avgRating: 0,
        totalRevenue: 0
    };
};

/**
 * Get customer value analysis
 * @param {string} businessId - Business ID
 * @param {Object} filters - Date filters
 * @returns {Object} - Value analysis
 */
const getCustomerValueAnalysis = async (businessId, filters = {}) => {
    const customers = await Customer.find({ business: businessId })
        .select('stats.totalSpent stats.totalVisits stats.loyaltyPoints')
        .sort({ 'stats.totalSpent': -1 });
    
    if (customers.length === 0) {
        return {
            topCustomers: [],
            valueDistribution: {},
            averageValue: 0
        };
    }
    
    // Get top 10 customers
    const topCustomers = customers.slice(0, 10).map(customer => ({
        id: customer._id,
        totalSpent: customer.stats.totalSpent,
        totalVisits: customer.stats.totalVisits,
        loyaltyPoints: customer.stats.loyaltyPoints,
        averageSpent: customer.stats.totalSpent / customer.stats.totalVisits
    }));
    
    // Value distribution
    const valueRanges = {
        low: customers.filter(c => c.stats.totalSpent < 1000).length,
        medium: customers.filter(c => c.stats.totalSpent >= 1000 && c.stats.totalSpent < 5000).length,
        high: customers.filter(c => c.stats.totalSpent >= 5000).length
    };
    
    const averageValue = customers.reduce((sum, c) => sum + c.stats.totalSpent, 0) / customers.length;
    
    return {
        topCustomers,
        valueDistribution: valueRanges,
        averageValue
    };
};

/**
 * Get customer retention data
 * @param {string} businessId - Business ID
 * @param {Object} filters - Date filters
 * @returns {Object} - Retention data
 */
const getCustomerRetentionData = async (businessId, filters = {}) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    const retentionData = {
        last30Days: await Customer.countDocuments({
            business: businessId,
            'stats.lastVisit': { $gte: thirtyDaysAgo }
        }),
        last60Days: await Customer.countDocuments({
            business: businessId,
            'stats.lastVisit': { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        }),
        last90Days: await Customer.countDocuments({
            business: businessId,
            'stats.lastVisit': { $gte: ninetyDaysAgo, $lt: sixtyDaysAgo }
        }),
        over90Days: await Customer.countDocuments({
            business: businessId,
            'stats.lastVisit': { $lt: ninetyDaysAgo }
        })
    };
    
    return retentionData;
};

/**
 * Get customer preferences
 * @param {string} businessId - Business ID
 * @returns {Object} - Customer preferences
 */
const getCustomerPreferences = async (businessId) => {
    const preferences = await Customer.aggregate([
        { $match: { business: businessId } },
        { $unwind: { path: '$preferences.preferredServices', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$preferences.preferredServices',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
    
    const genderDistribution = await Customer.aggregate([
        { $match: { business: businessId } },
        {
            $group: {
                _id: '$gender',
                count: { $sum: 1 }
            }
        }
    ]);
    
    return {
        preferredServices: preferences.filter(p => p._id),
        genderDistribution
    };
};

/**
 * Get customer growth over time
 * @param {string} businessId - Business ID
 * @param {Object} filters - Date filters
 * @returns {Array} - Growth data
 */
const getCustomerGrowthData = async (businessId, filters = {}) => {
    const { startDate, endDate, groupBy = 'month' } = filters;
    
    let dateFormat = '%Y-%m';
    if (groupBy === 'week') dateFormat = '%Y-%U';
    if (groupBy === 'day') dateFormat = '%Y-%m-%d';
    
    const matchQuery = { business: businessId };
    if (startDate && endDate) {
        matchQuery.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    
    const growthData = await Customer.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: dateFormat,
                        date: '$createdAt'
                    }
                },
                newCustomers: { $sum: 1 },
                totalSpent: { $sum: '$stats.totalSpent' }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    
    return growthData;
};

/**
 * Get customers for targeting
 * @param {string} businessId - Business ID
 * @param {Object} criteria - Targeting criteria
 * @returns {Array} - List of customer IDs
 */
const getTargetCustomers = async (businessId, criteria) => {
    let query = { business: businessId };
    
    // Apply targeting criteria
    if (criteria.customerType) {
        switch (criteria.customerType) {
            case 'new':
                query['stats.totalVisits'] = 1;
                break;
            case 'returning':
                query['stats.totalVisits'] = { $gte: 2, $lte: 4 };
                break;
            case 'loyalty':
                query['stats.totalVisits'] = { $gte: 5 };
                break;
            case 'inactive':
                const ninetyDaysAgo = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000));
                query['stats.lastVisit'] = { $lt: ninetyDaysAgo };
                break;
            case 'high_value':
                query['stats.totalSpent'] = { $gte: 5000 };
                break;
        }
    }
    
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
    if (criteria.ageRange) {
        const now = new Date();
        if (criteria.ageRange.min) {
            const maxBirthDate = new Date(now.getFullYear() - criteria.ageRange.min, now.getMonth(), now.getDate());
            query.dateOfBirth = { $lte: maxBirthDate };
        }
        if (criteria.ageRange.max) {
            const minBirthDate = new Date(now.getFullYear() - criteria.ageRange.max, now.getMonth(), now.getDate());
            query.dateOfBirth = { ...query.dateOfBirth, $gte: minBirthDate };
        }
    }
    if (criteria.location?.city) query['address.city'] = criteria.location.city;
    if (criteria.location?.state) query['address.state'] = criteria.location.state;
    if (criteria.location?.pincode) query['address.pincode'] = criteria.location.pincode;
    
    const customers = await Customer.find(query).select('_id name email phone');
    return customers;
};

/**
 * Get customer insights and recommendations
 * @param {string} businessId - Business ID
 * @returns {Object} - Insights and recommendations
 */
const getCustomerInsights = async (businessId) => {
    const analytics = await getCustomerAnalytics(businessId);
    const insights = [];
    const recommendations = [];
    
    // Analyze customer segments
    const { segments } = analytics;
    const totalCustomers = segments.new + segments.returning + segments.loyal + segments.inactive;
    
    if (segments.inactive > totalCustomers * 0.3) {
        insights.push("High percentage of inactive customers detected");
        recommendations.push("Launch a win-back campaign for inactive customers");
    }
    
    if (segments.new > segments.returning) {
        insights.push("Good customer acquisition but low retention");
        recommendations.push("Focus on improving customer retention strategies");
    }
    
    if (segments.loyal < totalCustomers * 0.1) {
        insights.push("Low percentage of loyal customers");
        recommendations.push("Implement loyalty program to increase customer retention");
    }
    
    // Analyze customer value
    const { value } = analytics;
    if (value.averageValue < 1000) {
        insights.push("Low average customer value");
        recommendations.push("Create upselling campaigns to increase customer value");
    }
    
    return {
        insights,
        recommendations,
        analytics
    };
};

module.exports = {
    getCustomerAnalytics,
    getCustomerSegments,
    getCustomerLifecycleData,
    getCustomerValueAnalysis,
    getCustomerRetentionData,
    getCustomerPreferences,
    getCustomerGrowthData,
    getTargetCustomers,
    getCustomerInsights
};
