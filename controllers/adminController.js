require('dotenv').config();
const Admin = require("../models/Admin");
const Business = require("../models/Business");
const Manager = require("../models/Manager");
const mongoose = require("mongoose");

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
    if (!id || id === 'undefined' || id === 'null') {
        return false;
    }
    return mongoose.Types.ObjectId.isValid(id);
};
const Staff = require("../models/Staff");
const Transaction = require("../models/Transaction");
const Customer = require("../models/Customer");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");
const Campaign = require("../models/Campaign");
const { setCache, getCache, deleteCache, getOrSet } = require("../utils/cache");
const { cacheKeys } = require("../config/redis");
const { formatCurrency } = require("../utils/businessUtils");
const { notifyNewBusinessCreated, notifyNewManagerCreated, notifyBusinessDeleted } = require("../utils/adminNotifications");
const { parseJsonFields, handleBusinessImages, deleteAllBusinessImages, deleteFromS3 } = require("../utils/fileHandler");

// ================== Admin Dashboard ==================
const getAdminDashboard = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { recentBusinessesPage = 1, recentBusinessesLimit = 15 } = req.query;
        const cacheKey = cacheKeys.adminDashboard(adminId);

        // Use getOrSet for optimal caching
        const dashboard = await getOrSet(cacheKey, async () => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // STEP 1: Get Admin and Business List in Parallel
            const [admin, businesses] = await Promise.all([
                Admin.findById(adminId).select('name companyName email').lean(),
                Business.find({ admin: adminId, isActive: true })
                    .select('type name branch businessLink managers staff')
                    .sort({ createdAt: -1 })
                    .lean()
            ]);

            if (!businesses.length) {
                return {
                    admin: admin || {},
                    stats: { businesses: { total: 0 }, managers: 0, staff: 0, totalRevenue: formatCurrency(0), totalAdditionalAmount: formatCurrency(0), totalCustomers: 0, recentTransactions: 0 },
                    analytics: { period: 'all-time', totalRevenue: 0, totalAdditionalAmount: 0, totalCustomers: 0, averageRevenuePerCustomer: 0, recentTransactions: 0, revenueByBusiness: {} },
                    businesses: []
                };
            }

            const businessIds = businesses.map(b => b._id);

            // STEP 2: Execute all heavy analytical queries in parallel
            const [managerCount, staffCount, additionalAmountPerBusiness, transactionStats, appointmentStats] = await Promise.all([
                // Managers Count
                Manager.countDocuments({ business: { $in: businessIds }, isActive: true }),
                
                // Staff Count
                Staff.countDocuments({ business: { $in: businessIds }, isActive: true }),
                
                // Per-Business Additional Amount (Aggregation)
                Appointment.aggregate([
                    { $match: { business: { $in: businessIds }, status: 'completed', additionalAmount: { $gt: 0 } } },
                    { $group: { _id: '$business', total: { $sum: '$additionalAmount' } } }
                ]),

                // Transaction Stats (30 days) - Single Aggregation for speed
                Transaction.aggregate([
                    { $match: { business: { $in: businessIds }, transactionDate: { $gte: thirtyDaysAgo } } },
                    {
                        $facet: {
                            totals: [{ $group: { _id: null, totalRevenue: { $sum: '$finalPrice' }, count: { $sum: 1 } } }],
                            customers: [{ $group: { _id: '$customerPhone' } }, { $count: 'total' }],
                            byBusiness: [{ $group: { _id: '$business', revenue: { $sum: '$finalPrice' } } }]
                        }
                    }
                ]),

                // Appointment Stats (30 days) - Single Aggregation for speed
                Appointment.aggregate([
                    { $match: { business: { $in: businessIds }, appointmentDate: { $gte: thirtyDaysAgo }, status: 'completed', additionalAmount: { $gt: 0 } } },
                    { $group: { _id: null, total: { $sum: '$additionalAmount' } } }
                ])
            ]);

            // STEP 3: Process the results
            const additionalAmountMap = {};
            additionalAmountPerBusiness.forEach(item => {
                additionalAmountMap[item._id.toString()] = item.total;
            });

            // Add totalAdditionalAmount to each business
            businesses.forEach(b => {
                b.totalAdditionalAmount = additionalAmountMap[b._id.toString()] || 0;
            });

            const businessStats = {
                total: businesses.length,
                salon: businesses.filter(b => b.type === 'salon').length,
                spa: businesses.filter(b => b.type === 'spa').length,
                hotel: businesses.filter(b => b.type === 'hotel').length
            };

            const tStats = transactionStats[0];
            const transactionRevenue = tStats.totals[0]?.totalRevenue || 0;
            const recentTransactionsCount = tStats.totals[0]?.count || 0;
            const totalCustomers = tStats.customers[0]?.total || 0;
            const totalAdditionalAmount = appointmentStats[0]?.total || 0;

            // Combine transaction revenue and additional amounts for total revenue
            const totalRevenue = transactionRevenue + totalAdditionalAmount;

            // Revenue by Business Type (using transaction and appointment aggregation results)
            const revenueByBusiness = {};
            const businessTypeMap = {};
            businesses.forEach(b => { businessTypeMap[b._id.toString()] = b.type; });

            // Add revenue from transactions
            tStats.byBusiness.forEach(item => {
                const type = businessTypeMap[item._id.toString()];
                if (type) {
                    revenueByBusiness[type] = (revenueByBusiness[type] || 0) + item.revenue;
                }
            });

            // Add revenue from additional amounts
            additionalAmountPerBusiness.forEach(item => {
                const type = businessTypeMap[item._id.toString()];
                if (type) {
                    revenueByBusiness[type] = (revenueByBusiness[type] || 0) + item.total;
                }
            });

            return {
                admin: { name: admin.name, companyName: admin.companyName, email: admin.email },
                stats: {
                    businesses: businessStats,
                    managers: managerCount,
                    staff: staffCount,
                    totalRevenue: formatCurrency(totalRevenue),
                    totalAdditionalAmount: formatCurrency(totalAdditionalAmount),
                    totalCustomers,
                    recentTransactions: recentTransactionsCount
                },
                analytics: {
                    period: 'monthly',
                    totalRevenue,
                    totalAdditionalAmount,
                    totalCustomers,
                    averageRevenuePerCustomer: totalCustomers > 0 ? totalRevenue / totalCustomers : 0,
                    recentTransactions: recentTransactionsCount,
                    revenueByBusiness
                },
                businesses: businesses
            };
        }, 300); // Cache for 5 minutes

        // Apply pagination
        const page = parseInt(recentBusinessesPage);
        const limit = parseInt(recentBusinessesLimit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedBusinesses = dashboard.businesses.slice(startIndex, endIndex);
        const totalPages = Math.ceil(dashboard.businesses.length / limit);

        const recentBusinesses = paginatedBusinesses.map(b => ({
            id: b._id,
            name: b.name,
            type: b.type,
            branch: b.branch,
            businessLink: b.businessLink,
            managersCount: b.managers?.length || 0,
            staffCount: b.staff?.length || 0,
            totalAdditionalAmount: b.totalAdditionalAmount || 0
        }));

        const { businesses, ...restDashboard } = dashboard;

        return res.json({
            success: true,
            data: {
                ...restDashboard,
                recentBusinesses,
                pagination: {
                    currentPage: page,
                    limit,
                    total: dashboard.businesses.length,
                    totalPages
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Create Business ==================
const createBusiness = async (req, res, next) => {
    try {
        // Parse JSON fields if multipart/form-data was used
        const body = parseJsonFields(req.body);

        const {
            // Basic Information
            type,
            name,
            branch,
            address,
            city,
            state,
            country,
            zipCode,
            phone,
            alternatePhone,
            email,
            website,
            description,

            // Location & Maps
            googleMapsUrl, // NEW: Google Maps URL for auto lat/lng extraction

            // Images
            images, // { logo, banner, gallery, thumbnail }

            // Social Media
            socialMedia, // { facebook, instagram, twitter, linkedin, youtube, whatsapp, telegram }

            // Registration & Legal
            registration, // { gstNumber, panNumber, registrationNumber, licenseNumber, taxId, registrationDate, expiryDate }

            // Category & Tags
            category,
            subCategory,
            tags,
            specialties,

            // Payment Methods
            paymentMethods, // { cash, card, upi, netBanking, wallet }

            // Bank Details
            bankDetails, // { accountName, accountNumber, bankName, ifscCode, branch, upiId, qrCode }

            // Business Capacity
            capacity, // { seatingCapacity, parkingSpaces, numberOfRooms, numberOfFloors, totalArea }

            // Ratings & Reviews
            ratings, // { average, totalReviews, fiveStars, fourStars, threeStars, twoStars, oneStar }

            // Features & Amenities
            features,
            amenities,

            // Languages Supported
            languages, // [{ type: String }] e.g., ["English", "Hindi", "Marathi"]

            // SEO & Marketing
            seo, // { metaTitle, metaDescription, keywords, ogImage }

            // Subscription
            subscription, // { plan, startDate, endDate, isActive, features }

            // Statistics
            statistics, // { totalCustomers, totalAppointments, totalRevenue, totalOrders, averageRating }

            // Notification Preferences
            notificationPreferences, // { emailNotifications, smsNotifications, whatsappNotifications, pushNotifications }

            // Business Hours & Days Off
            businessHours, // Mixed type for flexible business hours structure
            daysOff, // [{ type: Date }] Specific dates when business is closed

            // Holidays
            holidays, // [{ name, date, reason }]

            // Slug
            slug,

            // Settings
            settings
        } = body;
        const adminId = req.user.id;

        // Validate business type - now supports more types
        const validTypes = ["salon", "spa", "hotel", "restaurant", "retail", "gym", "clinic", "cafe", "studio", "education", "automotive", "others"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid business type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        // Prepare business data
        const businessData = {
            admin: adminId,
            type,
            name,
            branch,
            address,
            city,
            state,
            country: country || "India"
        };

        // Add optional fields only if provided
        if (zipCode) businessData.zipCode = zipCode;
        if (phone) businessData.phone = phone;
        if (alternatePhone) businessData.alternatePhone = alternatePhone;
        if (email) businessData.email = email;
        if (website) businessData.website = website;
        if (description) businessData.description = description;

        // NEW: Google Maps URL - coordinates will be auto-extracted by pre-save hook
        if (googleMapsUrl) businessData.googleMapsUrl = googleMapsUrl;

        // Images - handle both files and URLs
        businessData.images = await handleBusinessImages(req.files, images || {});

        // Social Media
        if (socialMedia) businessData.socialMedia = socialMedia;

        // Registration
        if (registration) businessData.registration = registration;

        // Category & Tags
        if (category) businessData.category = category;
        if (subCategory) businessData.subCategory = subCategory;
        if (tags) businessData.tags = tags;
        if (specialties) businessData.specialties = specialties;

        // Payment Methods
        if (paymentMethods) businessData.paymentMethods = paymentMethods;

        // Bank Details
        if (bankDetails) businessData.bankDetails = bankDetails;

        // Capacity
        if (capacity) businessData.capacity = capacity;

        // Ratings
        if (ratings) businessData.ratings = ratings;

        // Features & Amenities
        if (features) businessData.features = features;
        if (amenities) businessData.amenities = amenities;

        // Languages Supported
        if (languages) businessData.languages = languages;

        // SEO
        if (seo) businessData.seo = seo;

        // Subscription
        if (subscription) businessData.subscription = subscription;

        // Statistics - map to 'stats' as per model
        if (statistics) businessData.stats = statistics;

        // Notification Preferences - map to 'notifications' as per model
        if (notificationPreferences) businessData.notifications = notificationPreferences;

        // Slug support
        if (slug) businessData.slug = slug;

        // Business Hours
        if (businessHours) businessData.businessHours = businessHours;

        // Days Off
        if (daysOff) businessData.daysOff = daysOff;

        // Holidays
        if (holidays) businessData.holidays = holidays;

        // Settings with defaults
        businessData.settings = settings || {
            workingHours: {
                open: "09:00",
                close: "18:00",
                days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
            },
            currency: "INR",
            timezone: "Asia/Kolkata"
        };

        // Create business - pre-save hook will extract lat/lng from googleMapsUrl
        const business = await Business.create(businessData);

        // Create notification
        await notifyNewBusinessCreated(adminId, business);

        // Invalidate cache with wildcard
        await deleteCache(`admin:${adminId}:businesses:*`);
        await deleteCache(`admin:${adminId}:dashboard`);

        return res.status(201).json({
            success: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
            data: {
                id: business._id,
                name: business.name,
                type: business.type,
                branch: business.branch,
                businessLink: business.businessLink,
                location: business.location,
                googleMapsUrl: business.googleMapsUrl
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Businesses ==================
const getBusinesses = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { page = 1, limit = 10, type, search, status = 'active', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const cacheKey = `admin:${adminId}:businesses:${type || 'all'}:${search || 'none'}:${status}:${sortBy}:${sortOrder}:${page}:${limit}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortDir = sortOrder === 'asc' ? 1 : -1;

        const matchStage = { admin: new mongoose.Types.ObjectId(adminId) };

        if (status === 'active') {
            matchStage.isActive = true;
        } else if (status === 'inactive') {
            matchStage.isActive = false;
        }

        if (type && ['salon', 'spa', 'hotel', 'restaurant', 'retail', 'gym', 'clinic', 'cafe', 'studio', 'education', 'automotive', 'others'].includes(type)) {
            matchStage.type = type;
        }

        if (search) {
            matchStage.$or = [
                { name: { $regex: `^${search}`, $options: 'i' } },
                { branch: { $regex: `^${search}`, $options: 'i' } },
                { type: { $regex: `^${search}`, $options: 'i' } }
            ];
        }

        const sortableFields = ['name', 'type', 'branch', 'createdAt', 'managersCount', 'staffCount', 'servicesCount', 'remark'];
        const sortField = sortableFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortStage = { [sortField]: sortDir };

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const aggregationResult = await Business.aggregate([
            { $match: matchStage },
            {
                $addFields: {
                    managersCount: { $size: { $ifNull: ['$managers', []] } },
                    staffCount: { $size: { $ifNull: ['$staff', []] } },
                    isNew: { $gte: ['$createdAt', twentyFourHoursAgo] }
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: 'business',
                    as: 'services'
                }
            },
            {
                $addFields: {
                    servicesCount: { $size: '$services' }
                }
            },
            { $sort: sortStage },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limitNum },
                        {
                            $project: {
                                id: '$_id',
                                _id: 0,
                                name: 1,
                                type: 1,
                                branch: 1,
                                businessLink: 1,
                                isActive: 1,
                                managersCount: 1,
                                staffCount: 1,
                                servicesCount: 1,
                                isNew: 1,
                                remark: 1
                            }
                        }
                    ]
                }
            }
        ]);

        const total = aggregationResult[0]?.metadata[0]?.total || 0;
        const businesses = aggregationResult[0]?.data || [];

        const response = {
            success: true,
            data: businesses,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        };

        await setCache(cacheKey, response, 120);

        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Business by ID ==================
const getBusinessById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid Business ID is required"
            });
        }

        const cacheKey = `admin:${adminId}:business:${id}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", data: cachedData });
        }

        const businessData = await Business.findOne({
            _id: id,
            admin: adminId
        })
            .populate('admin', '-password -refreshToken')
            .lean();

        if (!businessData) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch managers and staff using the IDs stored in the business document
        // This ensures we return all data that is explicitly linked, even if back-references are missing
        const [managers, staff, servicesCount, appointmentsCount, totalCustomers, appointmentsToday] = await Promise.all([
            Manager.find({ _id: { $in: businessData.managers || [] } }).select('-password -pin').lean(),
            Staff.find({ _id: { $in: businessData.staff || [] } }).lean(),
            Service.countDocuments({ business: id }),
            Appointment.countDocuments({ business: id }),
            Customer.countDocuments({ business: id }),
            Appointment.countDocuments({ business: id, date: { $gte: today } })
        ]);

        businessData.id = businessData._id.toString();
        businessData.managers = managers;
        businessData.staff = staff;
        businessData.servicesCount = servicesCount;
        businessData.managersCount = managers.length;
        businessData.staffCount = staff.length;
        businessData.appointmentsCount = appointmentsCount;
        businessData.totalCustomers = totalCustomers;
        businessData.appointmentsToday = appointmentsToday;
        businessData.isNew = (Date.now() - new Date(businessData.createdAt).getTime()) < (24 * 60 * 60 * 1000);

        await setCache(cacheKey, businessData, 300);

        return res.json({
            success: true,
            data: businessData
        });

    } catch (err) {
        next(err);
    }
};

// ================== Update Business ==================
const updateBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = parseJsonFields(req.body);
        const adminId = req.user.id;

        // Check if business belongs to admin
        const business = await Business.findOne({ _id: id, admin: adminId });
        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        // Validate business type if being updated
        if (updates.type) {
            const validTypes = ["salon", "spa", "hotel", "restaurant", "retail", "gym", "clinic", "cafe", "studio", "education", "automotive", "others"];
            if (!validTypes.includes(updates.type)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid business type. Must be one of: ${validTypes.join(', ')}`
                });
            }
        }

        // Helper function for deep merging objects
        const deepMerge = (target, source) => {
            const output = { ...(target.toObject?.() || target) };

            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    // Recursively merge nested objects
                    if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                        output[key] = deepMerge(target[key], source[key]);
                    } else {
                        output[key] = source[key];
                    }
                } else {
                    // Direct assignment for primitives and arrays
                    output[key] = source[key];
                }
            }

            return output;
        };

        // Map frontend fields to model fields if provided
        if (updates.statistics) {
            updates.stats = updates.statistics;
            delete updates.statistics;
        }
        if (updates.notificationPreferences) {
            updates.notifications = updates.notificationPreferences;
            delete updates.notificationPreferences;
        }

        // Handle Images if files are uploaded or URLs are updated
        if (req.files && Object.keys(req.files).length > 0 || updates.images) {
            updates.images = await handleBusinessImages(req.files, updates.images || {}, business.images || {});
        }

        // Handle other S3 media updates (Google 360, Videos, SEO)
        // Check for removed Google 360 images
        if (Array.isArray(updates.google360ImageUrl) && Array.isArray(business.google360ImageUrl)) {
            const removed = business.google360ImageUrl.filter(url => !updates.google360ImageUrl.includes(url));
            for (const url of removed) await deleteFromS3(url);
        }

        // Check for removed videos
        if (Array.isArray(updates.videos) && Array.isArray(business.videos)) {
            const removed = business.videos.filter(url => !updates.videos.includes(url));
            for (const url of removed) await deleteFromS3(url);
        }

        // Check for removed SEO OG image
        if (updates.seo && updates.seo.ogImage && business.seo && business.seo.ogImage && updates.seo.ogImage !== business.seo.ogImage) {
            await deleteFromS3(business.seo.ogImage);
        } else if (updates.seo && updates.seo.ogImage === null && business.seo && business.seo.ogImage) {
            await deleteFromS3(business.seo.ogImage);
        }

        // Apply updates to the business object with deep merge
        Object.keys(updates).forEach(key => {
            if (updates[key] && typeof updates[key] === 'object' && !Array.isArray(updates[key]) && business[key]) {
                // For nested objects (like settings, seo, images, etc.), use deep merge
                business[key] = deepMerge(business[key], updates[key]);
            } else {
                // For primitive values and arrays, direct assignment
                business[key] = updates[key];
            }
        });

        business.isNew = false;
        const updatedBusiness = await business.save();

        // Populate the managers field after save
        await updatedBusiness.populate('managers', 'name username email phone isActive');

        // Invalidate cache
        const { deleteCache } = require("../utils/cache");
        await deleteCache(`admin:${adminId}:businesses:*`);
        await deleteCache(`admin:${adminId}:dashboard`);

        return res.json({
            success: true,
            message: "Business updated successfully",
            data: updatedBusiness
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Business status ==================
const updateBusinessStatus = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { id } = req.params;
        const { isActive } = req.body;

        const business = await Business.findOne({ _id: id, admin: adminId });
        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        // Update business
        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        const updatedBusiness = await Business.findByIdAndUpdate(id, updateData, { new: true });

        // Invalidate cache with wildcard
        await deleteCache(`admin:${adminId}:businesses:*`);
        await deleteCache(`admin:${adminId}:dashboard`);

        return res.json({
            success: true,
            message: "Business status updated successfully",
            data: {
                id: updatedBusiness._id,
                isActive: updatedBusiness.isActive,
                updatedAt: updatedBusiness.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// Add OR Update business Remark
const addOrUpdateBusinessRemark = async (req, res, next) =>{
    try {
        const { id } = req.params;
        const { remark } = req.body;
        const adminId = req.user.id;
        const business = await Business.findOne({ _id: id, admin: adminId });
        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }
        business.remark = remark;
        await business.save();
        return res.json({
            success: true,
            message: "Business remark updated successfully",
            data: {
                id: business._id,
                remark: business.remark,
                updatedAt: business.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
}

// ================== Delete Business ==================
const deleteBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        // Check if business belongs to admin
        const business = await Business.findOne({ _id: id, admin: adminId });
        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        // Invalidate cache immediately
        await deleteCache(`admin:${adminId}:businesses:*`);
        await deleteCache(`admin:${adminId}:dashboard`);

        // Hard delete
        await Business.findByIdAndDelete(id);

        // Delete associated S3 images
        await deleteAllBusinessImages(business);

        // Create notification
        await notifyBusinessDeleted(adminId, business.name);

        return res.json({ success: true, message: "Business deleted successfully" });
    } catch (err) {
        next(err);
    }
};

// ================== Create Manager for a Business ==================
const createManager = async (req, res, next) => {
    try {
        const { name, username, pin, businessId, email, phone } = req.body;
        const adminId = req.user.id;

        // Validate businessId
        if (!businessId || !isValidObjectId(businessId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Business ID is required"
            });
        }

        // Check if business belongs to admin
        const business = await Business.findOne({ _id: businessId, admin: adminId });
        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        // Check if username already exists
        const exists = await Manager.findOne({ username });
        if (exists) {
            return res.status(400).json({ success: false, message: "Username already taken" });
        }

        // Validate PIN (4 digits)
        if (!/^\d{4}$/.test(pin)) {
            return res.status(400).json({
                success: false,
                message: "PIN must be exactly 4 digits"
            });
        }

        const manager = await Manager.create({
            name,
            username,
            pin,
            business: businessId,
            email,
            phone
        });

        // Add manager to business
        await Business.findByIdAndUpdate(businessId, {
            $push: { managers: manager._id }
        });

        // Create notification
        await notifyNewManagerCreated(adminId, manager, business);

        // Invalidate cache with wildcard
        await deleteCache(`admin:${adminId}:businesses:*`);
        await deleteCache(`admin:${adminId}:dashboard`);

        return res.status(201).json({
            success: true,
            message: "Manager created successfully",
            data: {
                id: manager._id,
                name: manager.name,
                username: manager.username,
                business: business.name,
                businessLink: business.businessLink
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Managers ==================
const getManagers = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { page = 1, limit = 10, search, businessId } = req.query;
        const cacheKey = `admin:${adminId}:managers:${page}:${limit}:${search || ''}:${businessId || 'all'}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        let query = {};

        if (businessId) {
            // Verify business belongs to admin
            const business = await Business.findOne({ _id: businessId, admin: adminId }).select('_id');
            if (!business) {
                return res.status(404).json({ success: false, message: "Business not found or access denied" });
            }
            query.business = businessId;
        } else {
            // Get all businesses for this admin
            const businesses = await Business.find({ admin: adminId }).select('_id');
            const businessIds = businesses.map(b => b._id);
            query.business = { $in: businessIds };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const managers = await Manager.find(query)
            .populate('business', 'name type branch')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Manager.countDocuments(query);

        const response = {
            success: true,
            data: managers.map(manager => ({
                id: manager._id,
                name: manager.name,
                username: manager.username,
                pin: manager.pin, // Include PIN for admin view
                email: manager.email,
                phone: manager.phone,
                business: manager.business?.name || '—',
                businessId: manager.business?._id || null,
                businessType: manager.business?.type || null,
                businessBranch: manager.business?.branch || null,
                isActive: manager.isActive,
                createdAt: manager.createdAt
            })),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        };

        await setCache(cacheKey, response, 120);

        return res.json(response);
    } catch (error) {
        next(error);
    }
};

// ================== Get Manager by ID ==================
const getManagerById = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { id } = req.params;

        const manager = await Manager.findById(id).populate('business');
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        // Check if manager belongs to admin's business
        const business = await Business.findOne({ _id: manager.business, admin: adminId });
        if (!business) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Get staff count for this manager's business
        const staffCount = await Staff.countDocuments({ business: manager.business._id, isActive: true });

        return res.json({
            success: true,
            data: {
                id: manager._id,
                name: manager.name,
                username: manager.username,
                pin: manager.pin, // Include PIN for admin view
                email: manager.email,
                phone: manager.phone,
                business: {
                    id: manager.business._id,
                    name: manager.business.name,
                    type: manager.business.type,
                    branch: manager.business.branch,
                    businessLink: manager.business.businessLink
                },
                permissions: manager.permissions,
                staffCount,
                isActive: manager.isActive,
                createdAt: manager.createdAt,
                updatedAt: manager.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// ================== Update Manager ==================
const updateManager = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { id } = req.params;
        const { name, email, phone, username, pin, permissions } = req.body;

        const manager = await Manager.findById(id).populate('business');
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        // Check if manager belongs to admin's business
        const business = await Business.findOne({ _id: manager.business._id, admin: adminId });
        if (!business) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Check if username is being changed and if it already exists
        if (username && username !== manager.username) {
            const exists = await Manager.findOne({ username, _id: { $ne: id } });
            if (exists) {
                return res.status(400).json({ success: false, message: "Username already taken" });
            }
        }

        // Validate PIN if provided
        if (pin !== undefined && !/^\d{4}$/.test(pin)) {
            return res.status(400).json({
                success: false,
                message: "PIN must be exactly 4 digits"
            });
        }

        // Update manager
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (username !== undefined) updateData.username = username;
        if (pin !== undefined) updateData.pin = pin;
        if (permissions !== undefined) updateData.permissions = permissions;

        const updatedManager = await Manager.findByIdAndUpdate(id, updateData, { new: true }).populate('business');

        // Invalidate cache
        await deleteCache(`admin:${adminId}:managers:*`);
        await deleteCache(`admin:${adminId}:dashboard`);

        return res.json({
            success: true,
            message: "Manager updated successfully",
            data: {
                id: updatedManager._id,
                name: updatedManager.name,
                username: updatedManager.username,
                email: updatedManager.email,
                phone: updatedManager.phone,
                pinUpdated: pin !== undefined
            }
        });
    } catch (error) {
        next(error);
    }
};

// ================== Update Manager status ==================
const updateManagerStatus = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { id } = req.params;
        const { isActive } = req.body;

        const manager = await Manager.findById(id).populate('business');
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        // Check if manager belongs to admin's business
        const business = await Business.findOne({ _id: manager.business._id, admin: adminId });
        if (!business) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Update manager
        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        const updatedManager = await Manager.findByIdAndUpdate(id, updateData, { new: true }).populate('business');

        // Invalidate cache
        await deleteCache(`admin:${adminId}:managers:*`);
        await deleteCache(`admin:${adminId}:dashboard`);

        return res.json({
            success: true,
            message: "Manager updated successfully",
            data: {
                id: updatedManager._id,
                isActive: updatedManager.isActive,
                createdAt: updatedManager.createdAt,
                updatedAt: updatedManager.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// ================== Delete Manager ==================
const deleteManager = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { id } = req.params;

        const manager = await Manager.findById(id).populate('business');
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" });
        }

        // Check if manager belongs to admin's business
        const business = await Business.findOne({ _id: manager.business._id, admin: adminId });
        if (!business) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Permanent delete manager
        await Manager.findByIdAndDelete(id);

        // Delete all associated staff (as they required a manager reference)
        await Staff.deleteMany({ manager: id });

        // Remove manager from business managers array
        await Business.findByIdAndUpdate(manager.business._id, {
            $pull: { managers: manager._id }
        });

        // Invalidate cache
        await deleteCache(`admin:${adminId}:managers:*`);
        await deleteCache(`admin:${adminId}:dashboard`);
        await deleteCache(`business:${manager.business._id}:*`);

        return res.json({
            success: true,
            message: "Manager deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// ================== Get Business Link ==================
const getBusinessLink = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const adminId = req.user.id;

        // Validate businessId
        if (!businessId || !isValidObjectId(businessId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Business ID is required"
            });
        }

        const business = await Business.findOne({ _id: businessId, admin: adminId });
        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        const businessLink = `${process.env.BASE_URL || 'http://localhost:5000/api/api'}/${business.businessLink}`;

        return res.json({
            success: true,
            data: {
                businessId: business._id,
                businessName: business.name,
                businessLink,
                managersCount: business.managers?.length || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Admin Profile ==================
const getAdminProfile = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const admin = await Admin.findById(adminId).select('name companyName email phone createdAt updatedAt');

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        return res.json({
            success: true,
            data: admin
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Admin Profile ==================
const updateAdminProfile = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { name, companyName, email, phone } = req.body;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== admin.email) {
            const exists = await Admin.findOne({ email, _id: { $ne: adminId } });
            if (exists) {
                return res.status(400).json({ success: false, message: "Email already taken" });
            }
        }

        // Check if phone is being changed and if it already exists
        if (phone && phone !== admin.phone) {
            const exists = await Admin.findOne({ phone, _id: { $ne: adminId } });
            if (exists) {
                return res.status(400).json({ success: false, message: "Phone number already taken" });
            }
        }

        // Update admin
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (companyName !== undefined) updateData.companyName = companyName;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;

        const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, { new: true }).select('name companyName email phone');

        // Invalidate cache
        await deleteCache(`admin:${adminId}:dashboard`);

        return res.json({
            success: true,
            message: "Profile updated successfully",
            data: updatedAdmin
        });
    } catch (error) {
        next(error);
    }
};

// ================== Update Admin Password ==================
const updateAdminPassword = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        // Verify current password
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        admin.password = hashedPassword;
        await admin.save();

        return res.json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

// ================== Get Admin Stats ==================
const getAdminStats = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        // Cache removed for real-time updates as per requirement
        // const cacheKey = `admin:${adminId}:stats`;

        const { businessId: filterBusinessId, startDate, endDate } = req.query;

        // Base Business Filter
        // Always get ALL businesses for global customer count
        const allBusinesses = await Business.find({ admin: adminId }).select('_id');
        const allBusinessIds = allBusinesses.map(b => b._id);

        // Filtered business IDs (may be subset or all)
        let businessIds = allBusinessIds;
        if (filterBusinessId) {
            const business = await Business.findOne({ _id: filterBusinessId, admin: adminId });
            if (!business) {
                return res.json({ success: false, message: "Business not found or access denied" });
            }
            businessIds = [filterBusinessId];
        }

        // Date Filter for Transactions/Revenue
        const dateQuery = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateQuery.$gte = start;
            dateQuery.$lte = end;
        }

        // Prepare Queries with Date Filter
        const baseQuery = { business: { $in: businessIds } };
        const customerQuery = { business: { $in: businessIds } }; // Use filtered businessIds
        const appointmentQuery = { ...baseQuery };
        const transactionCountQuery = { ...baseQuery };
        const invoiceQuery = { ...baseQuery };

        if (Object.keys(dateQuery).length > 0) {
            // Filter Appointments by appointment date
            appointmentQuery.appointmentDate = dateQuery;
            // Filter Transactions by transaction date
            transactionCountQuery.transactionDate = dateQuery;
            // Filter Invoices by invoice date
            invoiceQuery.invoiceDate = dateQuery;
        }

        // Count all entities in parallel for better performance
        const [
            totalBusinesses,
            activeBusinesses,
            totalManagers,
            activeManagers,
            totalStaff,
            activeStaff,
            totalCustomers,
            activeCustomers,
            totalServices,
            activeServices,
            totalAppointments,
            completedAppointments,
            pendingAppointments,
            cancelledAppointments,
            totalTransactions,
            totalInvoices,
            paidInvoices,
            totalCampaigns
        ] = await Promise.all([
            Business.countDocuments({ admin: adminId }),
            Business.countDocuments({ admin: adminId, isActive: true }),
            Manager.countDocuments({ business: { $in: businessIds } }),
            Manager.countDocuments({ business: { $in: businessIds }, isActive: true }),
            Staff.countDocuments({ business: { $in: businessIds } }),
            Staff.countDocuments({ business: { $in: businessIds }, isActive: true }),
            Customer.countDocuments(customerQuery),
            Customer.countDocuments({ ...customerQuery, isActive: true }),
            Service.countDocuments({ business: { $in: businessIds } }),
            Service.countDocuments({ business: { $in: businessIds }, isActive: true }),
            Appointment.countDocuments(appointmentQuery),
            Appointment.countDocuments({ ...appointmentQuery, status: 'completed' }),
            Appointment.countDocuments({ ...appointmentQuery, status: 'pending' }),
            Appointment.countDocuments({ ...appointmentQuery, status: 'cancelled' }),
            Transaction.countDocuments(transactionCountQuery),
            Invoice.countDocuments(invoiceQuery),
            Invoice.countDocuments({ ...invoiceQuery, paymentStatus: 'paid' }),
            Campaign.countDocuments({ business: { $in: businessIds } })
        ]);

        // Calculate Customer Breakdown (Appointment-based vs Walk-in)
        // Online customers: Unique customers who have booked appointments
        const appointmentCustomerIds = await Appointment.distinct('customer', {
            business: { $in: businessIds },
            customer: { $ne: null }
        });
        const onlineCustomers = appointmentCustomerIds.length;

        // Walk-in customers: Unique phone numbers from transactions with no customer profile
        const walkInCustomerPhones = await Transaction.distinct('customerPhone', {
            business: { $in: businessIds },
            customer: null
        });
        const walkInCustomers = walkInCustomerPhones.length;

        const totalCustomersActual = onlineCustomers + walkInCustomers;
        const inactiveCustomers = totalCustomers - activeCustomers; // From registered customers



        // =================================================================================
        // HYBRID REVENUE CALCULATION (Transactions + Untracked Completed Appointments)
        // =================================================================================

        // 0. Pending Revenue (Snapshot - Always current, ignores date filter)
        // Includes: pending, confirmed, in_progress, rescheduled (all potential future revenue)
        const pendingAppointmentsList = await Appointment.find({
            business: { $in: businessIds },
            status: { $in: ['pending', 'confirmed', 'in_progress', 'rescheduled'] }
        }).select('totalAmount');
        const pendingRevenue = pendingAppointmentsList.reduce((sum, a) => sum + (a.totalAmount || 0), 0);

        // 1. Get real transactions
        const transactionQuery = { business: { $in: businessIds } };
        if (Object.keys(dateQuery).length > 0) {
            transactionQuery.transactionDate = dateQuery;
        }

        const transactions = await Transaction.find(transactionQuery)
            .populate('business', 'name')
            .populate('appointment', 'status')
            .populate('customer', 'firstName lastName')
            .sort({ transactionDate: -1 })
            .lean();

        // 2. Calculate values from Transactions
        const transactionRevenue = transactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
        const transactionAppointmentIds = transactions
            .filter(t => t.appointment)
            .map(t => t.appointment._id.toString());

        // 3. Find Completed Appointments that DO NOT have a Transaction
        const untrackedQuery = {
            business: { $in: businessIds },
            status: 'completed',
            _id: { $nin: transactionAppointmentIds }
        };
        // Apply date filter to appointment completion date if exists
        if (Object.keys(dateQuery).length > 0) {
            untrackedQuery.completedAt = dateQuery;
        }

        const untrackedAppointments = await Appointment.find(untrackedQuery)
            .populate('business', 'name')
            .populate('customer', 'firstName lastName')
            .sort({ completedAt: -1 })
            .lean();

        // 4. Calculate revenue from these appointments
        const appointmentRevenue = untrackedAppointments.reduce((sum, a) => sum + (a.totalAmount || 0), 0);

        // 5. Merge for Total Revenue
        const totalRevenue = transactionRevenue + appointmentRevenue;

        // 6. Map untracked appointments to "Transaction" format for display
        const impliedTransactions = untrackedAppointments.map(appt => ({
            _id: appt._id, // use appointment ID as fallback
            businessName: appt.business?.name,
            customerName: appt.customer ? `${appt.customer.firstName} ${appt.customer.lastName}` : 'Unknown',
            finalPrice: appt.totalAmount,
            paymentMethod: appt.paymentMethod || 'cash',
            paymentStatus: appt.paymentStatus || 'paid', // assumed if completed
            transactionDate: appt.completedAt || appt.updatedAt,
            appointmentStatus: appt.status,
            isImplied: true // flag to identify source
        }));

        // 7. Format Real Transactions
        const formattedRealTransactions = transactions.map(t => ({
            _id: t._id,
            businessName: t.business?.name,
            customerName: t.customerName || (t.customer ? `${t.customer.firstName} ${t.customer.lastName}` : 'Unknown'),
            finalPrice: t.finalPrice,
            paymentMethod: t.paymentMethod,
            paymentStatus: t.paymentStatus,
            transactionDate: t.transactionDate,
            appointmentStatus: t.appointment?.status
        }));

        // 8. Combine and Sort Lists (Completed/Paid only for display list)
        // Note: Real transactions might be 'pending', we count them separately
        const allCompletedTransactions = [
            ...formattedRealTransactions.filter(t => t.paymentStatus !== 'pending'),
            ...impliedTransactions
        ].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

        const pendingTransactionsCount = transactions.filter(t => t.paymentStatus === 'pending').length;
        const stats = {
            businesses: {
                total: totalBusinesses,
                active: activeBusinesses,
                inactive: totalBusinesses - activeBusinesses
            },
            managers: {
                total: totalManagers,
                active: activeManagers,
                inactive: totalManagers - activeManagers
            },
            staff: {
                total: totalStaff,
                active: activeStaff,
                inactive: totalStaff - activeStaff
            },
            customers: {
                total: totalCustomersActual,
                online: onlineCustomers,
                walkIn: walkInCustomers,
                active: activeCustomers,
                inactive: inactiveCustomers
            },
            services: {
                total: totalServices,
                active: activeServices,
                inactive: totalServices - activeServices
            },
            appointments: {
                total: totalAppointments,
                completed: completedAppointments,
                pending: pendingAppointments,
                cancelled: cancelledAppointments
            },
            transactions: {
                total: totalTransactions + untrackedAppointments.length, // Include implied transactions in count
                totalRevenue: formatCurrency(totalRevenue),
                totalRevenueRaw: totalRevenue,
                pendingRevenue: formatCurrency(pendingRevenue),
                pendingRevenueRaw: pendingRevenue,
                pending: pendingTransactionsCount,
                completed: allCompletedTransactions
            },
            invoices: {
                total: totalInvoices,
                paid: paidInvoices,
                unpaid: totalInvoices - paidInvoices
            },
            campaigns: {
                total: totalCampaigns
            },
            // Grand totals
            grandTotals: {
                allEntities: totalBusinesses + totalManagers + totalStaff + totalCustomers +
                    totalServices + totalAppointments + totalTransactions +
                    totalInvoices + totalCampaigns,
                allActiveEntities: activeBusinesses + activeManagers + activeStaff +
                    activeCustomers + activeServices
            }
        };

        const response = {
            success: true,
            data: stats
        };

        // Cache removed for real-time updates
        // await setCache(cacheKey, response, 300);

        return res.json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminDashboard,
    getAdminStats,
    createBusiness,
    getBusinesses,
    getBusinessById,
    updateBusiness,
    addOrUpdateBusinessRemark,
    updateBusinessStatus,
    deleteBusiness,
    createManager,
    getManagers,
    getManagerById,
    updateManager,
    updateManagerStatus,
    deleteManager,
    getBusinessLink,
    getAdminProfile,
    updateAdminProfile,
    updateAdminPassword
};
