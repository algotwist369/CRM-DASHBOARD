// businessUtils.js - Business-specific utility functions

/**
 * Generate business link for manager access
 * @param {string} companyName - Admin's company name
 * @param {string} businessId - Business ID
 * @returns {string} - Generated business link
 */
const generateBusinessLink = (companyName, businessId) => {
    const cleanCompanyName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Extract last 3 digits from businessId ObjectId for shorter link
    const shortId = businessId.toString().slice(-3);
    return `${cleanCompanyName}_${shortId}`;
};

/**
 * Calculate daily business metrics
 * @param {Array} transactions - Array of transactions
 * @returns {Object} - Calculated metrics
 */
const calculateDailyMetrics = (transactions) => {
    const metrics = {
        totalCustomers: transactions.length,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        serviceBreakdown: {},
        staffPerformance: {},
        averageServiceTime: 0,
        customerSatisfaction: 0
    };

    let totalServiceTime = 0;
    let totalRating = 0;
    let ratingCount = 0;

    transactions.forEach(transaction => {
        // Revenue calculation
        metrics.totalRevenue += transaction.finalPrice || 0;
        
        // Service breakdown
        const serviceType = transaction.serviceType || 'other';
        if (!metrics.serviceBreakdown[serviceType]) {
            metrics.serviceBreakdown[serviceType] = {
                count: 0,
                revenue: 0
            };
        }
        metrics.serviceBreakdown[serviceType].count++;
        metrics.serviceBreakdown[serviceType].revenue += transaction.finalPrice || 0;

        // Staff performance
        if (transaction.staff) {
            const staffId = transaction.staff.toString();
            if (!metrics.staffPerformance[staffId]) {
                metrics.staffPerformance[staffId] = {
                    customersServed: 0,
                    revenue: 0,
                    commission: 0
                };
            }
            metrics.staffPerformance[staffId].customersServed++;
            metrics.staffPerformance[staffId].revenue += transaction.finalPrice || 0;
            metrics.staffPerformance[staffId].commission += transaction.staffCommission || 0;
        }

        // Service time calculation
        if (transaction.duration) {
            totalServiceTime += transaction.duration;
        }

        // Rating calculation
        if (transaction.rating) {
            totalRating += transaction.rating;
            ratingCount++;
        }
    });

    // Calculate averages
    metrics.netProfit = metrics.totalRevenue - metrics.totalExpenses;
    metrics.averageServiceTime = transactions.length > 0 ? totalServiceTime / transactions.length : 0;
    metrics.customerSatisfaction = ratingCount > 0 ? totalRating / ratingCount : 0;

    return metrics;
};

/**
 * Generate business analytics data
 * @param {Array} dailyBusinessRecords - Array of daily business records
 * @param {string} period - Time period (daily, weekly, monthly, yearly)
 * @returns {Object} - Analytics data
 */
const generateBusinessAnalytics = (dailyBusinessRecords, period = 'monthly') => {
    const analytics = {
        period,
        totalRevenue: 0,
        totalCustomers: 0,
        totalExpenses: 0,
        netProfit: 0,
        averageDailyRevenue: 0,
        averageDailyCustomers: 0,
        growthRate: 0,
        topServices: [],
        staffPerformance: [],
        trends: {
            revenue: [],
            customers: [],
            profit: []
        }
    };

    if (dailyBusinessRecords.length === 0) {
        return analytics;
    }

    // Calculate totals
    dailyBusinessRecords.forEach(record => {
        analytics.totalRevenue += record.totalIncome || 0;
        analytics.totalCustomers += record.totalCustomers || 0;
        analytics.totalExpenses += record.totalExpenses || 0;
    });

    analytics.netProfit = analytics.totalRevenue - analytics.totalExpenses;
    analytics.averageDailyRevenue = analytics.totalRevenue / dailyBusinessRecords.length;
    analytics.averageDailyCustomers = analytics.totalCustomers / dailyBusinessRecords.length;

    // Calculate growth rate (comparing first and last records)
    if (dailyBusinessRecords.length > 1) {
        const firstRecord = dailyBusinessRecords[dailyBusinessRecords.length - 1];
        const lastRecord = dailyBusinessRecords[0];
        const firstRevenue = firstRecord.totalIncome || 0;
        const lastRevenue = lastRecord.totalIncome || 0;
        
        if (firstRevenue > 0) {
            analytics.growthRate = ((lastRevenue - firstRevenue) / firstRevenue) * 100;
        }
    }

    // Extract top services
    const serviceStats = {};
    dailyBusinessRecords.forEach(record => {
        if (record.services) {
            record.services.forEach(service => {
                if (!serviceStats[service.serviceName]) {
                    serviceStats[service.serviceName] = {
                        name: service.serviceName,
                        revenue: 0,
                        customers: 0
                    };
                }
                serviceStats[service.serviceName].revenue += service.totalRevenue || 0;
                serviceStats[service.serviceName].customers += service.customerCount || 0;
            });
        }
    });

    analytics.topServices = Object.values(serviceStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return analytics;
};

/**
 * Validate business type and return appropriate service types
 * @param {string} businessType - Type of business (salon, spa, hotel)
 * @returns {Array} - Array of valid service types
 */
const getServiceTypesForBusiness = (businessType) => {
    const serviceTypes = {
        salon: ['hair', 'facial', 'nail', 'other'],
        spa: ['facial', 'massage', 'spa', 'other'],
        hotel: ['room', 'food', 'spa', 'other']
    };

    return serviceTypes[businessType] || ['other'];
};

/**
 * Generate business report data
 * @param {Object} business - Business object
 * @param {Array} transactions - Array of transactions
 * @param {Array} dailyBusiness - Array of daily business records
 * @param {Date} startDate - Report start date
 * @param {Date} endDate - Report end date
 * @returns {Object} - Formatted report data
 */
const generateBusinessReport = (business, transactions, dailyBusiness, startDate, endDate) => {
    const report = {
        business: {
            name: business.name,
            type: business.type,
            branch: business.branch,
            address: business.address
        },
        period: {
            start: startDate,
            end: endDate
        },
        summary: {
            totalRevenue: 0,
            totalCustomers: 0,
            totalTransactions: transactions.length,
            averageTransactionValue: 0,
            netProfit: 0
        },
        dailyBreakdown: [],
        serviceAnalysis: {},
        staffPerformance: {},
        recommendations: []
    };

    // Calculate summary
    transactions.forEach(transaction => {
        report.summary.totalRevenue += transaction.finalPrice || 0;
    });

    report.summary.totalCustomers = new Set(transactions.map(t => t.customerPhone)).size;
    report.summary.averageTransactionValue = transactions.length > 0 
        ? report.summary.totalRevenue / transactions.length 
        : 0;

    // Calculate net profit from daily business records
    dailyBusiness.forEach(record => {
        report.summary.netProfit += record.netProfit || 0;
    });

    // Generate recommendations
    if (report.summary.averageTransactionValue < 500) {
        report.recommendations.push("Consider upselling premium services to increase average transaction value");
    }

    if (report.summary.totalCustomers < 50) {
        report.recommendations.push("Focus on customer acquisition strategies");
    }

    return report;
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currency = 'INR') => {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    return formatter.format(amount);
};

/**
 * Calculate staff commission
 * @param {number} revenue - Revenue amount
 * @param {number} commissionRate - Commission rate (percentage)
 * @returns {number} - Commission amount
 */
const calculateCommission = (revenue, commissionRate) => {
    return (revenue * commissionRate) / 100;
};

module.exports = {
    generateBusinessLink,
    calculateDailyMetrics,
    generateBusinessAnalytics,
    getServiceTypesForBusiness,
    generateBusinessReport,
    formatCurrency,
    calculateCommission
};
