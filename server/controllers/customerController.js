// customerController.js - Customer management operations
const Customer = require("../models/Customer");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const Appointment = require("../models/Appointment");
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

        // Check if customer exists by phone
        let customer = await Customer.findOne({ business: business._id, phone });

        if (customer) {
            // Update existing customer
            // Check for email conflict if email is being updated
            if (email && email !== customer.email) {
                const emailExists = await Customer.findOne({
                    business: business._id,
                    email,
                    _id: { $ne: customer._id }
                });
                if (emailExists) {
                    return res.status(400).json({
                        success: false,
                        message: "Email already in use by another customer"
                    });
                }
            }

            // Update fields
            customer.firstName = firstName;
            customer.lastName = lastName;
            customer.email = email;
            customer.alternatePhone = alternatePhone;
            customer.dateOfBirth = dateOfBirth;
            customer.gender = gender;
            customer.anniversary = anniversary;
            customer.address = address;
            customer.profilePicture = profilePicture;
            customer.preferredLanguage = preferredLanguage;
            customer.source = source;
            customer.referredBy = referredBy;
            customer.preferences = preferences;
            customer.tags = tags;
            customer.category = category;
            customer.notes = notes;
            customer.internalNotes = internalNotes;
            customer.marketingConsent = marketingConsent;
            customer.socialMedia = socialMedia;
            customer.emergencyContact = emergencyContact;
            customer.customFields = customFields;

            customer.updatedBy = userId;
            customer.updatedByModel = userRole === 'admin' ? 'Admin' : 'Manager';

            await customer.save();

            // Invalidate cache
            await deleteCache(`business:${business._id}:customers`);

            return res.status(200).json({
                success: true,
                message: "Customer updated successfully",
                data: {
                    id: customer._id,
                    fullName: customer.fullName,
                    phone: customer.phone,
                    email: customer.email,
                    customerType: customer.customerType
                }
            });
        }

        // Check for email duplicate (for new customer)
        if (email) {
            const emailExists = await Customer.findOne({ business: business._id, email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use by another customer"
                });
            }
        }

        // Create customer
        customer = await Customer.create({
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
        let businessIds = [];
        let business;

        if (userRole === 'admin') {
            if (businessId) {
                business = await Business.findOne({ _id: businessId, admin: userId });
                if (business) businessIds = [business._id];
            } else {
                const businesses = await Business.find({ admin: userId }).select('_id');
                businessIds = businesses.map(b => b._id);
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager) {
                business = await Business.findById(manager.business);
                if (business) businessIds = [business._id];
            }
        }

        if (businessIds.length === 0) {
            if (userRole === 'admin' && !businessId) {
                return res.json({
                    success: true,
                    data: [],
                    pagination: {
                        total: 0,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        pages: 0
                    }
                });
            }
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        const cacheKeyPrefix = businessId ? `business:${businessId}` : `admin:${userId}`;
        const cacheKey = `${cacheKeyPrefix}:customers:${page}:${limit}:${search}:${customerType}:${tags}:${sortBy}:${sortOrder}`;

        // Try cache first
        // NOTE: Caching is disabled to ensure real-time stats are accurate.
        // const cachedData = await getCache(cacheKey);
        // if (cachedData) {
        //     return res.json({ success: true, source: "cache", ...cachedData });
        // }

        // Build query
        let query = { isActive: true };
        if (businessIds.length === 1) {
            query.business = businessIds[0];
        } else {
            query.business = { $in: businessIds };
        }

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

        // Calculate real-time stats for these customers
        const customerIds = customers.map(c => c._id);
        const appointmentStats = await Appointment.aggregate([
            {
                $match: {
                    customer: { $in: customerIds },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: "$customer",
                    totalVisits: { $sum: 1 },
                    totalSpent: { $sum: "$totalAmount" },
                    lastVisit: { $max: "$appointmentDate" }
                }
            }
        ]);

        const statsMap = {};
        appointmentStats.forEach(stat => {
            statsMap[stat._id.toString()] = stat;
        });

        const total = await Customer.countDocuments(query);

        const response = {
            success: true,
            data: customers.map(customer => {
                const stats = statsMap[customer._id.toString()] || {};
                const totalVisits = stats.totalVisits || customer.totalVisits || 0;
                const totalSpent = stats.totalSpent || customer.totalSpent || 0;
                // Calculate average spent if visits > 0
                const averageSpent = totalVisits > 0 ? Math.round(totalSpent / totalVisits) : 0;

                return {
                    id: customer._id,
                    fullName: `${customer.firstName} ${customer.lastName || ''}`.trim(),
                    email: customer.email,
                    phone: customer.phone,
                    customerType: customer.customerType,
                    totalVisits: totalVisits,
                    totalSpent: totalSpent,
                    averageSpent: averageSpent,
                    lastVisit: stats.lastVisit || customer.lastVisit,
                    loyaltyPoints: customer.loyaltyPoints,
                    membershipTier: customer.membershipTier,
                    tags: customer.tags,
                    isActive: customer.isActive,
                    createdAt: customer.createdAt
                };
            }),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        };

        // Cache for 2 minutes
        // await setCache(cacheKey, response, 120);

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
            .populate('createdBy', 'name email role')
            .populate('updatedBy', 'name email role')
            .lean();

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

        // Calculate real-time stats
        const stats = await Appointment.aggregate([
            {
                $match: {
                    customer: customer._id,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: "$customer",
                    totalVisits: { $sum: 1 },
                    totalSpent: { $sum: "$totalAmount" },
                    lastVisit: { $max: "$appointmentDate" }
                }
            }
        ]);

        if (stats.length > 0) {
            const stat = stats[0];
            customer.totalVisits = stat.totalVisits;
            customer.totalSpent = stat.totalSpent;
            customer.lastVisit = stat.lastVisit;
            customer.averageSpent = stat.totalVisits > 0 ? Math.round(stat.totalSpent / stat.totalVisits) : 0;
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
        let businessIds = [];
        let business;

        if (userRole === 'admin') {
            if (businessId) {
                business = await Business.findOne({ _id: businessId, admin: userId });
                if (business) businessIds = [business._id];
            } else {
                const businesses = await Business.find({ admin: userId }).select('_id');
                businessIds = businesses.map(b => b._id);
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager) {
                business = await Business.findById(manager.business);
                if (business) businessIds = [business._id];
            }
        }

        if (businessIds.length === 0) {
            if (userRole === 'admin' && !businessId) {
                return res.json({
                    success: true,
                    data: {
                        totalCustomers: 0,
                        newCustomers: 0,
                        regularCustomers: 0,
                        vipCustomers: 0,
                        inactiveCustomers: 0,
                        totalSpent: 0,
                        totalVisits: 0,
                        averageSpent: 0,
                        totalLoyaltyPoints: 0
                    }
                });
            }
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        const cacheKeyPrefix = businessId ? `business:${businessId}` : `admin:${userId}`;
        const cacheKey = `${cacheKeyPrefix}:customer:stats`;

        // Try cache first
        // const cachedData = await getCache(cacheKey);
        // if (cachedData) {
        //     return res.json({ success: true, source: "cache", data: cachedData });
        // }

        // Build query
        let query = { isActive: true };
        if (businessIds.length === 1) {
            query.business = businessIds[0];
        } else {
            query.business = { $in: businessIds };
        }

        // Aggregate statistics
        const stats = await Customer.aggregate([
            { $match: query },
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
        // await setCache(cacheKey, result, 300);

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

// ================== Lookup Customer ==================
const lookupCustomer = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { phone, businessId } = req.query;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        // Determine business ID
        let businessIds = [];
        let business;

        if (userRole === 'admin') {
            if (businessId) {
                business = await Business.findOne({ _id: businessId, admin: userId });
                if (business) businessIds = [business._id];
            } else {
                const businesses = await Business.find({ admin: userId }).select('_id');
                businessIds = businesses.map(b => b._id);
            }
        } else if (userRole === 'manager') {
            const manager = await Manager.findById(userId);
            if (manager) {
                business = await Business.findById(manager.business);
                if (business) businessIds = [business._id];
            }
        }

        if (businessIds.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Business not found or access denied"
            });
        }

        // Build query
        let query = { phone: phone, isActive: true };
        if (businessIds.length === 1) {
            query.business = businessIds[0];
        } else {
            query.business = { $in: businessIds };
        }

        const customer = await Customer.findOne(query)
            .populate('business', 'name type branch')
            .populate('preferences.preferredStaff', 'name role')
            .lean();

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.json({
            success: true,
            data: customer
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
