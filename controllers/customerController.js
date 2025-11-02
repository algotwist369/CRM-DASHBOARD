// customerController.js - Customer management and analytics

const Customer = require("../models/Customer");
const Appointment = require("../models/Appointment");
const Transaction = require("../models/Transaction");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const { setCache, getCache, deleteCache } = require("../utils/cache");
const { 
    getCustomerAnalytics: getCustomerAnalyticsUtil, 
    getCustomerSegments: getCustomerSegmentsUtil, 
    getTargetCustomers: getTargetCustomersUtil,
    getCustomerInsights: getCustomerInsightsUtil 
} = require("../utils/customerAnalytics");

// ================== Get Customers ==================
const getCustomers = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { 
            page = 1, 
            limit = 10, 
            search, 
            segment, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;
        
        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const cacheKey = `manager:${managerId}:customers:${search}:${segment}:${sortBy}:${sortOrder}:${page}:${limit}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }
        
        let query = { business: manager.business._id };
        
        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Segment filter
        if (segment) {
            switch (segment) {
                case 'new':
                    query['stats.totalVisits'] = 1;
                    break;
                case 'returning':
                    query['stats.totalVisits'] = { $gte: 2, $lte: 4 };
                    break;
                case 'loyal':
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
        
        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const customers = await Customer.find(query)
            .select('-__v')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Customer.countDocuments(query);
        
        const response = {
            success: true,
            data: customers.map(c => c.toObject()),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        };
        
        await setCache(cacheKey, response, 120);
        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Customer Details ==================
const getCustomerDetails = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const managerId = req.user.id;
        
        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const customer = await Customer.findOne({
            _id: customerId,
            business: manager.business._id
        });
        
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: "Customer not found" 
            });
        }
        
        // Get customer's appointments
        const appointments = await Appointment.find({ customer: customerId })
            .populate('staff', 'name role specialization')
            .sort({ appointmentDate: -1 })
            .limit(10);
        
        // Get customer's transactions
        const transactions = await Transaction.find({ customer: customerId })
            .populate('staff', 'name role')
            .sort({ transactionDate: -1 })
            .limit(10);
        
        // Get customer analytics
        const customerAnalytics = {
            totalAppointments: await Appointment.countDocuments({ customer: customerId }),
            totalTransactions: await Transaction.countDocuments({ customer: customerId }),
            averageSpending: customer.stats.totalSpent / Math.max(customer.stats.totalVisits, 1),
            lastVisit: customer.stats.lastVisit,
            loyaltyPoints: customer.stats.loyaltyPoints,
            averageRating: customer.stats.averageRating
        };
        
        return res.json({
            success: true,
            data: {
                customer: customer.toObject(),
                appointments: appointments.map(a => a.toObject()),
                transactions: transactions.map(t => t.toObject()),
                analytics: customerAnalytics
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Customer ==================
const updateCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const managerId = req.user.id;
        const updateData = req.body;
        
        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const customer = await Customer.findOneAndUpdate(
            { _id: customerId, business: manager.business._id },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: "Customer not found" 
            });
        }
        
        // Invalidate cache
        await deleteCache(`manager:${managerId}:customers`);
        await deleteCache(`customer:${customerId}`);
        
        return res.json({
            success: true,
            message: "Customer updated successfully",
            data: customer.toObject()
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Customer Segments ==================
const getCustomerSegments = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        
        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const cacheKey = `manager:${managerId}:customer-segments`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }
        
        const segments = await getCustomerSegmentsUtil(manager.business._id);
        
        await setCache(cacheKey, segments, 300);
        return res.json({
            success: true,
            data: segments
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Customer Analytics ==================
const getCustomerAnalytics = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { startDate, endDate, groupBy } = req.query;
        
        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const cacheKey = `manager:${managerId}:customer-analytics:${startDate}:${endDate}:${groupBy}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }
        
        const analytics = await getCustomerAnalyticsUtil(manager.business._id, {
            startDate,
            endDate,
            groupBy
        });
        
        await setCache(cacheKey, analytics, 300);
        return res.json({
            success: true,
            data: analytics
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Customer Insights ==================
const getCustomerInsights = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        
        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const cacheKey = `manager:${managerId}:customer-insights`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }
        
        const insights = await getCustomerInsightsUtil(manager.business._id);
        
        await setCache(cacheKey, insights, 600);
        return res.json({
            success: true,
            data: insights
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Target Customers ==================
const getTargetCustomers = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const { criteria } = req.body;
        
        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const customers = await getTargetCustomersUtil(manager.business._id, criteria);
        
        return res.json({
            success: true,
            data: {
                customers: customers.map(c => c.toObject()),
                count: customers.length
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Add Customer Note ==================
const addCustomerNote = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const managerId = req.user.id;
        const { note, type = 'general' } = req.body;
        
        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const customer = await Customer.findOne({
            _id: customerId,
            business: manager.business._id
        });
        
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: "Customer not found" 
            });
        }
        
        // Add note to customer preferences
        if (!customer.preferences.notes) {
            customer.preferences.notes = '';
        }
        
        const timestamp = new Date().toISOString();
        const newNote = `[${timestamp}] ${type.toUpperCase()}: ${note}`;
        customer.preferences.notes += `\n${newNote}`;
        
        await customer.save();
        
        // Invalidate cache
        await deleteCache(`customer:${customerId}`);
        await deleteCache(`manager:${managerId}:customers`);
        
        return res.json({
            success: true,
            message: "Note added successfully",
            data: {
                note: newNote,
                customerId: customer._id
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Customer Timeline ==================
const getCustomerTimeline = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const managerId = req.user.id;
        
        // Get manager's business
        const manager = await Manager.findById(managerId).populate('business');
        if (!manager || !manager.business) {
            return res.status(404).json({ 
                success: false, 
                message: "Manager or business not found" 
            });
        }
        
        const customer = await Customer.findOne({
            _id: customerId,
            business: manager.business._id
        });
        
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: "Customer not found" 
            });
        }
        
        // Get customer timeline events
        const appointments = await Appointment.find({ customer: customerId })
            .populate('staff', 'name role')
            .sort({ appointmentDate: -1 });
        
        // Transactions don't have a customer field, they have customerPhone
        // Find transactions by customer phone number
        const transactions = await Transaction.find({ 
            customerPhone: customer.phone,
            business: manager.business._id
        })
            .populate('staff', 'name role')
            .sort({ transactionDate: -1 });
        
        // Combine and sort timeline events
        const timeline = [
            ...appointments.map(apt => {
                const services = Array.isArray(apt.services) 
                    ? apt.services.map(s => s?.serviceName || s).join(', ')
                    : apt.serviceName || 'Service';
                return {
                    type: 'appointment',
                    date: apt.appointmentDate,
                    title: `Appointment - ${apt.status || 'Scheduled'}`,
                    description: `${services} with ${apt.staff?.name || 'TBD'}`,
                    data: apt.toObject()
                };
            }),
            ...transactions.map(txn => {
                const services = Array.isArray(txn.services) 
                    ? txn.services.map(s => s?.serviceName || s).join(', ')
                    : txn.serviceName || 'Service';
                return {
                    type: 'transaction',
                    date: txn.transactionDate,
                    title: `Transaction - ${txn.paymentStatus || 'Completed'}`,
                    description: `${services} - ₹${txn.finalPrice || txn.basePrice || 0}`,
                    data: txn.toObject()
                };
            })
        ].sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(0);
            const dateB = b.date ? new Date(b.date) : new Date(0);
            return dateB - dateA;
        });
        
        return res.json({
            success: true,
            data: {
                customer: customer.toObject(),
                timeline
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getCustomers,
    getCustomerDetails,
    updateCustomer,
    getCustomerSegments,
    getCustomerAnalytics,
    getCustomerInsights,
    getTargetCustomers,
    addCustomerNote,
    getCustomerTimeline
};
