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

    const customers = await Customer.find({ business: businessId })
        .select('createdAt stats totalVisits totalSpent averageSpent loyaltyPoints averageRating lastVisit firstVisit isActive');

    const segments = await getCustomerSegments(businessId, customers);
    const totalCustomers = customers.length;

    let newCustomersInRange = segments.new;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        newCustomersInRange = customers.filter((customer) => {
            if (!customer.createdAt) return false;
            const createdAt = new Date(customer.createdAt);
            const visits = getStatValue(customer, 'totalVisits', 0);
            return createdAt >= start && createdAt <= end && visits <= 1;
        }).length;
    }

    const lifecycleData = await getCustomerLifecycleData(businessId, filters, customers);
    const valueAnalysis = await getCustomerValueAnalysis(businessId, filters, customers);
    const retentionData = await getCustomerRetentionData(businessId, filters, customers);
    const preferences = await getCustomerPreferences(businessId);
    const growthData = await getCustomerGrowthData(businessId, filters);

    return {
        overview: {
            totalCustomers,
            newCustomers: newCustomersInRange,
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
const getCustomerSegments = async (businessId, customers = null) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

    let dataset = customers;
    if (!dataset) {
        dataset = await Customer.find({ business: businessId })
            .select('stats totalVisits totalSpent lastVisit isActive');
    }

    if (!dataset || dataset.length === 0) {
        return {
            new: 0,
            returning: 0,
            loyal: 0,
            inactive: 0,
            highValue: 0,
            recent: 0
        };
    }

    const segments = {
        new: 0,
        returning: 0,
        loyal: 0,
        inactive: 0,
        highValue: 0,
        recent: 0
    };

    dataset.forEach((customer) => {
        const visits = getStatValue(customer, 'totalVisits', 0);
        const totalSpent = getStatValue(customer, 'totalSpent', 0);
        const lastVisit = getDateValue(customer, 'lastVisit');
        const isActive = customer.isActive !== undefined ? customer.isActive : true;

        if (visits <= 1) {
            segments.new += 1;
        } else if (visits >= 2 && visits <= 4) {
            segments.returning += 1;
        } else if (visits >= 5) {
            segments.loyal += 1;
        }

        if (totalSpent >= 5000) {
            segments.highValue += 1;
        }

        if (lastVisit && lastVisit >= thirtyDaysAgo) {
            segments.recent += 1;
        }

        if (!isActive || !lastVisit || lastVisit < ninetyDaysAgo) {
            segments.inactive += 1;
        }
    });

    return segments;
};

/**
 * Get customer lifecycle data
 * @param {string} businessId - Business ID
 * @param {Object} filters - Date filters
 * @returns {Object} - Lifecycle data
 */
const getCustomerLifecycleData = async (businessId, filters = {}, customers = null) => {
    const { startDate, endDate } = filters;

    let dataset = customers;
    if (!dataset) {
        const query = { business: businessId };
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        dataset = await Customer.find(query)
            .select('stats totalSpent totalVisits loyaltyPoints averageRating createdAt');
    } else if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        dataset = dataset.filter((customer) => {
            if (!customer.createdAt) return false;
            const createdAt = new Date(customer.createdAt);
            return createdAt >= start && createdAt <= end;
        });
    }

    if (!dataset || dataset.length === 0) {
        return {
            avgFirstVisit: 0,
            avgTotalSpent: 0,
            avgLoyaltyPoints: 0,
            avgRating: 0,
            totalRevenue: 0
        };
    }

    const count = dataset.length;
    const totalVisitsSum = dataset.reduce((sum, customer) => sum + getStatValue(customer, 'totalVisits', 0), 0);
    const totalSpentSum = dataset.reduce((sum, customer) => sum + getStatValue(customer, 'totalSpent', 0), 0);
    const loyaltyPointsSum = dataset.reduce((sum, customer) => sum + getStatValue(customer, 'loyaltyPoints', 0), 0);
    const ratingSum = dataset.reduce((sum, customer) => sum + getStatValue(customer, 'averageRating', 0), 0);

    return {
        avgFirstVisit: count > 0 ? totalVisitsSum / count : 0,
        avgTotalSpent: count > 0 ? totalSpentSum / count : 0,
        avgLoyaltyPoints: count > 0 ? loyaltyPointsSum / count : 0,
        avgRating: count > 0 ? ratingSum / count : 0,
        totalRevenue: totalSpentSum
    };
};

const getStatValue = (customer, key, fallback = 0) => {
    if (customer?.stats && customer.stats[key] !== undefined && customer.stats[key] !== null) {
        return customer.stats[key];
    }
    if (customer && customer[key] !== undefined && customer[key] !== null) {
        return customer[key];
    }
    return fallback;
};

const getDateValue = (customer, key) => {
    let value = null;
    if (customer?.stats && customer.stats[key]) {
        value = customer.stats[key];
    } else if (customer && customer[key]) {
        value = customer[key];
    }
    return value ? new Date(value) : null;
};

/**
 * Get customer value analysis
 * @param {string} businessId - Business ID
 * @param {Object} filters - Date filters
 * @returns {Object} - Value analysis
 */
const getCustomerValueAnalysis = async (businessId, filters = {}, customers = null) => {
    let dataset = customers;
    if (!dataset) {
        dataset = await Customer.find({ business: businessId })
            .select('stats totalSpent totalVisits averageSpent loyaltyPoints averageRating');
    } else {
        dataset = customers.map((customer) => (customer?.toObject ? customer.toObject() : customer));
    }

    if (!dataset || dataset.length === 0) {
        return {
            avgFirstVisit: 0,
            avgTotalSpent: 0,
            totalRevenue: 0,
            avgRating: 0,
            avgLoyaltyPoints: 0,
            topCustomers: [],
            valueDistribution: {},
            averageValue: 0
        };
    }

    // Calculate averages from customer stats
    const totalSpent = dataset.reduce((sum, c) => sum + getStatValue(c, 'totalSpent', 0), 0);
    const totalVisits = dataset.reduce((sum, c) => sum + getStatValue(c, 'totalVisits', 0), 0);
    const totalRating = dataset.reduce((sum, c) => sum + getStatValue(c, 'averageRating', 0), 0);
    const totalLoyaltyPoints = dataset.reduce((sum, c) => sum + getStatValue(c, 'loyaltyPoints', 0), 0);

    // Get top 10 customers
    const topCustomers = dataset
        .slice()
        .sort((a, b) => (getStatValue(b, 'totalSpent', 0) - getStatValue(a, 'totalSpent', 0)))
        .slice(0, 10)
        .map(customer => {
            const customerTotalSpent = getStatValue(customer, 'totalSpent', 0);
            const customerTotalVisits = getStatValue(customer, 'totalVisits', 0);

            return {
                id: customer._id,
                totalSpent: customerTotalSpent,
                totalVisits: customerTotalVisits,
                loyaltyPoints: getStatValue(customer, 'loyaltyPoints', 0),
                averageSpent: customerTotalVisits > 0
                    ? customerTotalSpent / customerTotalVisits
                    : 0
            };
        });
    
    // Value distribution
    const valueRanges = {
        low: dataset.filter(c => getStatValue(c, 'totalSpent', 0) < 1000).length,
        medium: dataset.filter(c => {
            const spend = getStatValue(c, 'totalSpent', 0);
            return spend >= 1000 && spend < 5000;
        }).length,
        high: dataset.filter(c => getStatValue(c, 'totalSpent', 0) >= 5000).length
    };

    const denominator = dataset.length > 0 ? dataset.length : 1;
    const averageValue = dataset.length > 0 ? totalSpent / denominator : 0;
    const avgFirstVisit = dataset.length > 0 ? totalVisits / denominator : 0;
    const avgTotalSpent = dataset.length > 0 ? totalSpent / denominator : 0;
    const avgRating = dataset.length > 0 ? totalRating / denominator : 0;
    const avgLoyaltyPoints = dataset.length > 0 ? totalLoyaltyPoints / denominator : 0;

    return {
        avgFirstVisit,
        avgTotalSpent,
        totalRevenue: totalSpent,
        avgRating,
        avgLoyaltyPoints,
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
const getCustomerRetentionData = async (businessId, filters = {}, customers = null) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

    let dataset = customers;
    if (!dataset) {
        dataset = await Customer.find({ business: businessId })
            .select('stats.lastVisit lastVisit');
    }

    if (!dataset || dataset.length === 0) {
        return {
            last30Days: 0,
            last60Days: 0,
            last90Days: 0,
            over90Days: 0
        };
    }

    const retentionData = {
        last30Days: 0,
        last60Days: 0,
        last90Days: 0,
        over90Days: 0
    };

    dataset.forEach((customer) => {
        const lastVisit = getDateValue(customer, 'lastVisit');

        if (lastVisit && lastVisit >= thirtyDaysAgo) {
            retentionData.last30Days += 1;
        } else if (lastVisit && lastVisit >= sixtyDaysAgo) {
            retentionData.last60Days += 1;
        } else if (lastVisit && lastVisit >= ninetyDaysAgo) {
            retentionData.last90Days += 1;
        } else {
            retentionData.over90Days += 1;
        }
    });

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
    if (groupBy === 'weekly' || groupBy === 'week') dateFormat = '%Y-%U';
    if (groupBy === 'daily' || groupBy === 'day') dateFormat = '%Y-%m-%d';
    if (groupBy === 'yearly' || groupBy === 'year') dateFormat = '%Y';
    if (groupBy === 'monthly' || groupBy === 'month') dateFormat = '%Y-%m';
    
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
                count: { $sum: 1 },
                totalSpent: { $sum: { $ifNull: ['$stats.totalSpent', 0] } }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    
    // Calculate cumulative total
    let cumulativeTotal = 0;
    const growthWithTotal = growthData.map(item => {
        cumulativeTotal += item.count;
        return {
            ...item,
            period: item._id,
            total: cumulativeTotal
        };
    });
    
    return growthWithTotal;
};

/**
 * Get customers for targeting
 * @param {string} businessId - Business ID
 * @param {Object} criteria - Targeting criteria
 * @returns {Array} - List of customer IDs
 */
const getTargetCustomers = async (businessId, criteria = {}) => {
    const query = { business: businessId };

    if (criteria.gender?.length) {
        query.gender = { $in: criteria.gender };
    }
    if (criteria.location?.city) query['address.city'] = criteria.location.city;
    if (criteria.location?.state) query['address.state'] = criteria.location.state;
    if (criteria.location?.pincode) query['address.pincode'] = criteria.location.pincode;

    const customers = await Customer.find(query)
        .select('firstName lastName email phone gender dateOfBirth address preferences stats totalVisits totalSpent averageSpent loyaltyPoints lastVisit createdAt isActive customerType')
        .lean();

    if (!customers.length) return [];

    const ninetyDaysAgo = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000));

    const filtered = customers.filter((customer) => {
        const visits = getStatValue(customer, 'totalVisits', 0);
        const totalSpent = getStatValue(customer, 'totalSpent', 0);
        const lastVisit = getDateValue(customer, 'lastVisit');

        if (criteria.customerType) {
            const type = String(criteria.customerType).toLowerCase();
            if (type === 'new' && !(visits <= 1)) return false;
            if (type === 'returning' && !(visits >= 2 && visits <= 4)) return false;
            if ((type === 'loyal' || type === 'loyalty') && visits < 5) return false;
            if (type === 'inactive' && !( !lastVisit || lastVisit < ninetyDaysAgo)) return false;
            if ((type === 'high_value' || type === 'highvalue') && totalSpent < 5000) return false;
        }

        if (criteria.minVisits && visits < criteria.minVisits) return false;
        if (criteria.maxVisits && visits > criteria.maxVisits) return false;

        if (criteria.minSpent && totalSpent < criteria.minSpent) return false;
        if (criteria.maxSpent && totalSpent > criteria.maxSpent) return false;

        if (criteria.lastVisitDays) {
            if (!lastVisit) return false;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - criteria.lastVisitDays);
            if (lastVisit < cutoffDate) return false;
        }

        if (criteria.preferredServices?.length) {
            const preferredServices = customer.preferences?.preferredServices || [];
            const normalizedServices = preferredServices.map((service) => {
                if (typeof service === 'string') return service.toLowerCase();
                if (!service) return null;
                return (service.name || service.serviceName || service.title || '').toLowerCase();
            }).filter(Boolean);

            const hasMatch = criteria.preferredServices.some((service) =>
                normalizedServices.includes(service.toLowerCase())
            );

            if (!hasMatch) return false;
        }

        if (criteria.ageRange?.min || criteria.ageRange?.max) {
            if (!customer.dateOfBirth) return false;
            const birthDate = new Date(customer.dateOfBirth);
            if (Number.isNaN(birthDate.getTime())) return false;
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            if (criteria.ageRange.min && age < criteria.ageRange.min) return false;
            if (criteria.ageRange.max && age > criteria.ageRange.max) return false;
        }

        return true;
    });

    filtered.sort((a, b) => getStatValue(b, 'totalSpent', 0) - getStatValue(a, 'totalSpent', 0));

    return filtered;
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
    
    if (totalCustomers === 0) {
        insights.push("No customer data available");
        recommendations.push("Start acquiring customers through marketing campaigns");
        return {
            insights,
            recommendations,
            analytics
        };
    }
    
    // Segment-based insights
    const inactivePercentage = (segments.inactive / totalCustomers) * 100;
    if (inactivePercentage > 30) {
        insights.push(`High percentage of inactive customers (${inactivePercentage.toFixed(1)}%)`);
        recommendations.push("Launch a win-back campaign for inactive customers with special offers");
    } else if (segments.inactive > 0) {
        insights.push(`${segments.inactive} inactive customers identified (${inactivePercentage.toFixed(1)}%)`);
        recommendations.push("Consider sending personalized offers to re-engage inactive customers");
    }
    
    const newPercentage = (segments.new / totalCustomers) * 100;
    const returningPercentage = (segments.returning / totalCustomers) * 100;
    
    if (segments.new > segments.returning && segments.new > 0) {
        insights.push(`Good customer acquisition (${newPercentage.toFixed(1)}% new customers) but low retention (${returningPercentage.toFixed(1)}% returning)`);
        recommendations.push("Focus on improving customer retention strategies - follow up with new customers after first visit");
    }
    
    const loyalPercentage = (segments.loyal / totalCustomers) * 100;
    if (loyalPercentage < 10 && segments.loyal > 0) {
        insights.push(`Low percentage of loyal customers (${loyalPercentage.toFixed(1)}%)`);
        recommendations.push("Implement a loyalty program with rewards to increase customer retention");
    } else if (loyalPercentage >= 10) {
        insights.push(`Strong loyalty base with ${loyalPercentage.toFixed(1)}% loyal customers`);
        recommendations.push("Reward loyal customers with exclusive offers and VIP treatment");
    }
    
    // Analyze customer value
    const { value } = analytics;
    if (value && value.averageValue !== undefined) {
        if (value.averageValue < 1000) {
            insights.push(`Low average customer value (${value.averageValue.toFixed(0)} per customer)`);
            recommendations.push("Create upselling campaigns and bundle offers to increase customer value");
        } else if (value.averageValue >= 1000 && value.averageValue < 3000) {
            insights.push(`Moderate customer value (₹${value.averageValue.toFixed(0)} per customer)`);
            recommendations.push("Continue upselling strategies and introduce premium service packages");
        } else {
            insights.push(`Strong customer value (₹${value.averageValue.toFixed(0)} per customer)`);
            recommendations.push("Maintain premium offerings and consider introducing VIP membership tiers");
        }
    }
    
    // Analyze retention
    const { retention } = analytics;
    if (retention) {
        const retentionRate = totalCustomers > 0 ? ((retention.last30Days / totalCustomers) * 100) : 0;
        if (retentionRate < 20) {
            insights.push(`Low customer retention rate (${retentionRate.toFixed(1)}% active in last 30 days)`);
            recommendations.push("Improve customer engagement through regular communication and personalized offers");
        }
    }
    
    // Growth insights
    const { growth } = analytics;
    if (growth && growth.length > 0) {
        const recentGrowth = growth[growth.length - 1];
        const previousGrowth = growth.length > 1 ? growth[growth.length - 2] : null;
        
        if (previousGrowth && recentGrowth.count > previousGrowth.count) {
            const growthRate = ((recentGrowth.count - previousGrowth.count) / previousGrowth.count) * 100;
            insights.push(`Positive customer growth trend: ${growthRate.toFixed(1)}% increase`);
            recommendations.push("Leverage growth momentum by expanding marketing channels and referral programs");
        } else if (previousGrowth && recentGrowth.count < previousGrowth.count) {
            insights.push("Declining customer acquisition detected");
            recommendations.push("Review marketing strategies and customer acquisition channels");
        }
    }
    
    // Preferences insights
    const { preferences } = analytics;
    if (preferences && preferences.preferredServices && preferences.preferredServices.length > 0) {
        const topService = preferences.preferredServices[0];
        insights.push(`Most popular service: ${topService._id || topService.name || 'N/A'} (${topService.count || 0} customers)`);
        recommendations.push(`Promote ${topService._id || topService.name || 'top services'} more aggressively in marketing campaigns`);
    }
    
    // Default recommendations if none generated
    if (recommendations.length === 0) {
        recommendations.push("Continue monitoring customer behavior and engagement metrics");
        recommendations.push("Regularly review and update marketing strategies based on customer feedback");
    }
    
    // Default insights if none generated
    if (insights.length === 0) {
        insights.push(`Total customer base: ${totalCustomers} customers`);
        insights.push(`Customer segments are well balanced`);
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
