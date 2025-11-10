// customerController.js - Customer management operations
const Customer = require("../models/Customer");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const { setCache, getCache, deleteCache } = require("../utils/cache");
const {
    getCustomerAnalytics: buildCustomerAnalytics,
    getCustomerInsights: buildCustomerInsights,
    getTargetCustomers: buildTargetCustomers
} = require("../utils/customerAnalytics");

const resolveBusinessContext = async (req, { requireBusinessIdForAdmin = false } = {}) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { businessId } = req.query;

    if (userRole === 'admin') {
        if (requireBusinessIdForAdmin && !businessId) {
            return { error: { status: 400, message: "Business ID is required" } };
        }
        if (!businessId) {
            return { error: { status: 400, message: "Business ID is required" } };
        }
        const business = await Business.findOne({ _id: businessId, admin: userId });
        if (!business) {
            return { error: { status: 404, message: "Business not found or access denied" } };
        }
        return { business };
    }

    if (userRole === 'manager') {
        const manager = await Manager.findById(userId);
        if (!manager) {
            return { error: { status: 404, message: "Manager not found" } };
        }
        const business = await Business.findById(manager.business);
        if (!business) {
            return { error: { status: 404, message: "Business not found or access denied" } };
        }
        return { business, manager };
    }

    return { error: { status: 403, message: "Access denied" } };
};

// ================== Create Customer ==================
const createCustomer = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const {
            businessId,
            firstName,
            lastName,
            email,
            phone,
            alternatePhone,
            dateOfBirth,
            gender,
            anniversary,
            address,
            profilePicture,
            preferredLanguage,
            source,
            referredBy,
            preferences,
            tags,
            category,
            notes,
            internalNotes,
            marketingConsent,
            socialMedia,
            emergencyContact,
            customFields
        } = req.body;

        // Determine business ID based on user role
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (!manager) {
                return res.status(404).json({
                    success: false,
                    message: "Manager not found"
                });
            }
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        // Check for duplicate customers
        const duplicates = await Customer.findDuplicates(business._id, phone, email);
        if (duplicates.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Customer with this phone or email already exists",
                duplicates: duplicates.map(c => ({
                    id: c._id,
                    name: c.fullName,
                    phone: c.phone,
                    email: c.email
                }))
            });
        }

        // Create customer
        const customer = await Customer.create({
            business: business._id,
            firstName,
            lastName,
            email,
            phone,
            alternatePhone,
            dateOfBirth,
            gender,
            anniversary,
            address,
            profilePicture,
            preferredLanguage,
            source,
            referredBy,
            preferences,
            tags,
            category,
            notes,
            internalNotes,
            marketingConsent,
            socialMedia,
            emergencyContact,
            customFields,
            createdBy: userId,
            createdByModel: userRole === 'admin' ? 'Admin' : 'Manager',
            firstVisit: new Date()
        });

        // Invalidate cache
        await deleteCache(`business:${business._id}:customers`);

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: {
                id: customer._id,
                fullName: customer.fullName,
                phone: customer.phone,
                email: customer.email,
                customerType: customer.customerType
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Customers ==================
const getCustomers = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const {
            businessId,
            page = 1,
            limit = 20,
            search,
            customerType,
            tags,
            sortBy = 'lastVisit',
            sortOrder = 'desc'
        } = req.query;

        // Determine business ID
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        const cacheKey = `business:${business._id}:customers:${page}:${limit}:${search}:${customerType}:${tags}:${sortBy}:${sortOrder}`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        // Build query
        let query = { business: business._id, isActive: true };

        // Filter by customer type
        if (customerType) {
            query.customerType = customerType;
        }

        // Filter by tags
        if (tags) {
            query.tags = { $in: tags.split(',') };
        }

        // Search
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const customers = await Customer.find(query)
            .populate('preferences.preferredStaff', 'name role')
            .populate('referredBy', 'firstName lastName phone')
            .select('-internalNotes') // Hide internal notes from regular view
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort(sortOptions)
            .lean();

        const total = await Customer.countDocuments(query);

        const response = {
            success: true,
            data: customers.map(customer => ({
                id: customer._id,
                fullName: `${customer.firstName} ${customer.lastName || ''}`.trim(),
                email: customer.email,
                phone: customer.phone,
                customerType: customer.customerType,
                totalVisits: customer.totalVisits,
                totalSpent: customer.totalSpent,
                averageSpent: customer.averageSpent,
                lastVisit: customer.lastVisit,
                loyaltyPoints: customer.loyaltyPoints,
                membershipTier: customer.membershipTier,
                tags: customer.tags,
                isActive: customer.isActive,
                createdAt: customer.createdAt
            })),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        };

        // Cache for 2 minutes
        await setCache(cacheKey, response, 120);

        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Customer by ID ==================
const getCustomerById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { id } = req.params;

        const customer = await Customer.findById(id)
            .populate('business', 'name type branch')
            .populate('preferences.preferredStaff', 'name role phone')
            .populate('preferences.preferredServices', 'name price duration')
            .populate('referredBy', 'firstName lastName phone email')
            .populate('createdBy')
            .populate('updatedBy');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Verify access
        if (userRole === 'admin') {
            const business = await Business.findOne({
                _id: customer.business._id,
                admin: userId
            });
            if (!business) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager.business.toString() !== customer.business._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        return res.json({
            success: true,
            data: customer
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Customer ==================
const updateCustomer = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { id } = req.params;
        const updates = req.body;

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Verify access
        if (userRole === 'admin') {
            const business = await Business.findOne({
                _id: customer.business,
                admin: userId
            });
            if (!business) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager.business.toString() !== customer.business.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        // Update customer
        Object.assign(customer, updates);
        customer.updatedBy = userId;
        customer.updatedByModel = userRole === 'admin' ? 'Admin' : 'Manager';

        await customer.save();

        // Invalidate cache
        await deleteCache(`business:${customer.business}:customers`);

        return res.json({
            success: true,
            message: "Customer updated successfully",
            data: customer
        });
    } catch (err) {
        next(err);
    }
};

// ================== Delete Customer (Soft Delete) ==================
const deleteCustomer = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { id } = req.params;

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Verify access
        if (userRole === 'admin') {
            const business = await Business.findOne({
                _id: customer.business,
                admin: userId
            });
            if (!business) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager.business.toString() !== customer.business.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        // Soft delete
        customer.isActive = false;
        customer.updatedBy = userId;
        customer.updatedByModel = userRole === 'admin' ? 'Admin' : 'Manager';
        await customer.save();

        // Invalidate cache
        await deleteCache(`business:${customer.business}:customers`);

        return res.json({
            success: true,
            message: "Customer deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Customer Statistics ==================
const getCustomerStats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { businessId } = req.query;

        // Determine business ID
        let business;
        if (userRole === 'admin') {
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "Business ID is required"
                });
            }
            business = await Business.findOne({ _id: businessId, admin: userId });
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            business = await Business.findById(manager.business);
        }

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        const cacheKey = `business:${business._id}:customer:stats`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", data: cachedData });
        }

        // Aggregate statistics
        const stats = await Customer.aggregate([
            { $match: { business: business._id, isActive: true } },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    newCustomers: {
                        $sum: { $cond: [{ $eq: ['$customerType', 'new'] }, 1, 0] }
                    },
                    regularCustomers: {
                        $sum: { $cond: [{ $eq: ['$customerType', 'regular'] }, 1, 0] }
                    },
                    vipCustomers: {
                        $sum: { $cond: [{ $eq: ['$customerType', 'vip'] }, 1, 0] }
                    },
                    inactiveCustomers: {
                        $sum: { $cond: [{ $eq: ['$customerType', 'inactive'] }, 1, 0] }
                    },
                    totalSpent: { $sum: '$totalSpent' },
                    totalVisits: { $sum: '$totalVisits' },
                    averageSpent: { $avg: '$averageSpent' },
                    totalLoyaltyPoints: { $sum: '$loyaltyPoints' }
                }
            }
        ]);

        const result = stats[0] || {
            totalCustomers: 0,
            newCustomers: 0,
            regularCustomers: 0,
            vipCustomers: 0,
            inactiveCustomers: 0,
            totalSpent: 0,
            totalVisits: 0,
            averageSpent: 0,
            totalLoyaltyPoints: 0
        };

        // Cache for 5 minutes
        await setCache(cacheKey, result, 300);

        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

// ================== Add Loyalty Points ==================
const addLoyaltyPoints = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { points } = req.body;

        if (!points || points <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid points amount is required"
            });
        }

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        await customer.addLoyaltyPoints(points);

        return res.json({
            success: true,
            message: `${points} loyalty points added successfully`,
            data: {
                currentPoints: customer.loyaltyPoints,
                membershipTier: customer.membershipTier
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Redeem Loyalty Points ==================
const redeemLoyaltyPoints = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { points } = req.body;

        if (!points || points <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid points amount is required"
            });
        }

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const redeemed = await customer.redeemPoints(points);

        if (!redeemed) {
            return res.status(400).json({
                success: false,
                message: "Insufficient loyalty points"
            });
        }

        return res.json({
            success: true,
            message: `${points} loyalty points redeemed successfully`,
            data: {
                remainingPoints: customer.loyaltyPoints,
                membershipTier: customer.membershipTier
            }
        });
    } catch (err) {
        next(err);
    }
};

const respondWithCustomerAnalytics = async (req, res, next) => {
    try {
        const { business, error } = await resolveBusinessContext(req, { requireBusinessIdForAdmin: req.user.role === 'admin' });
        if (error) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        const { startDate, endDate, groupBy } = req.query;
        const cacheKey = `business:${business._id}:customer:analytics:${startDate || 'all'}:${endDate || 'all'}:${groupBy || 'month'}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", data: cachedData });
        }

        const analytics = await buildCustomerAnalytics(business._id, { startDate, endDate, groupBy });
        await setCache(cacheKey, analytics, 300);

        return res.json({
            success: true,
            data: analytics
        });
    } catch (err) {
        next(err);
    }
};

const getCustomerInsightsData = async (req, res, next) => {
    try {
        const { business, error } = await resolveBusinessContext(req, { requireBusinessIdForAdmin: req.user.role === 'admin' });
        if (error) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        const cacheKey = `business:${business._id}:customer:insights`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", data: cachedData });
        }

        const insights = await buildCustomerInsights(business._id);
        await setCache(cacheKey, insights, 300);

        return res.json({
            success: true,
            data: insights
        });
    } catch (err) {
        next(err);
    }
};

const getTargetCustomersData = async (req, res, next) => {
    try {
        const { business, error } = await resolveBusinessContext(req, { requireBusinessIdForAdmin: req.user.role === 'admin' });
        if (error) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        const criteria = req.body || {};
        const customers = await buildTargetCustomers(business._id, criteria);

        return res.json({
            success: true,
            data: {
                total: customers.length,
                customers
            }
        });
    } catch (err) {
        next(err);
    }
};

const getCustomerAnalyticsData = respondWithCustomerAnalytics;
const getCustomerSegmentsData = respondWithCustomerAnalytics;

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    addLoyaltyPoints,
    redeemLoyaltyPoints,
    getCustomerAnalytics: getCustomerAnalyticsData,
    getCustomerSegments: getCustomerSegmentsData,
    getCustomerInsights: getCustomerInsightsData,
    getTargetCustomers: getTargetCustomersData
};
