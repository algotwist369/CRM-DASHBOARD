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
const { setCache, getCache, deleteCache, getOrSet } = require("../utils/cache");
const { cacheKeys } = require("../config/redis");
const { formatCurrency } = require("../utils/businessUtils");
const { notifyNewBusinessCreated, notifyNewManagerCreated, notifyBusinessDeleted } = require("../utils/adminNotifications");

// ================== Admin Dashboard ==================
const getAdminDashboard = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { recentBusinessesPage = 1, recentBusinessesLimit = 5 } = req.query;
        const cacheKey = cacheKeys.adminDashboard(adminId);

        // Use getOrSet for optimal caching
        const dashboard = await getOrSet(cacheKey, async () => {
            // Get admin info
            const admin = await Admin.findById(adminId).select('name companyName email');
            
            // Get businesses count by type with optimized query
            const businesses = await Business.find({ admin: adminId, isActive: true })
                .select('type name branch businessLink managers staff')
                .sort({ createdAt: -1 }) // Sort by newest first
                .lean(); // Use lean() for better performance
            
            const businessStats = {
                total: businesses.length,
                salon: businesses.filter(b => b.type === 'salon').length,
                spa: businesses.filter(b => b.type === 'spa').length,
                hotel: businesses.filter(b => b.type === 'hotel').length
            };

            // Get managers count with optimized query
            const managerCount = await Manager.countDocuments({ 
                business: { $in: businesses.map(b => b._id) },
                isActive: true 
            });

            // Get staff count with optimized query
            const staffCount = await Staff.countDocuments({ 
                business: { $in: businesses.map(b => b._id) },
                isActive: true 
            });

            // Get recent transactions (last 30 days) with optimized query
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            // Only query transactions if there are businesses
            let recentTransactions = [];
            if (businesses.length > 0) {
                recentTransactions = await Transaction.find({
                    business: { $in: businesses.map(b => b._id) },
                    transactionDate: { $gte: thirtyDaysAgo, $exists: true, $ne: null }
                }).select('finalPrice customerPhone transactionDate business').lean();
            }

            const totalRevenue = recentTransactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
            const totalCustomers = new Set(recentTransactions.map(t => t.customerPhone)).size;

            // Create simple analytics for admin dashboard
            // Note: generateBusinessAnalytics expects daily business records, not businesses
            const analytics = {
                period: 'monthly',
                totalRevenue: totalRevenue,
                totalCustomers: totalCustomers,
                averageRevenuePerCustomer: totalCustomers > 0 ? totalRevenue / totalCustomers : 0,
                recentTransactions: recentTransactions.length,
                revenueByBusiness: {}
            };

            // Calculate revenue by business type
            // Create a map of business IDs to types for efficient lookup
            const businessTypeMap = {};
            businesses.forEach(business => {
                businessTypeMap[business._id.toString()] = business.type;
            });

            // Calculate revenue by business type
            recentTransactions.forEach(transaction => {
                const businessId = transaction.business?.toString();
                if (businessId && businessTypeMap[businessId]) {
                    const businessType = businessTypeMap[businessId];
                    if (!analytics.revenueByBusiness[businessType]) {
                        analytics.revenueByBusiness[businessType] = 0;
                    }
                    analytics.revenueByBusiness[businessType] += (transaction.finalPrice || 0);
                }
            });

            return {
                admin: {
                    name: admin.name,
                    companyName: admin.companyName,
                    email: admin.email
                },
                stats: {
                    businesses: businessStats,
                    managers: managerCount,
                    staff: staffCount,
                    totalRevenue: formatCurrency(totalRevenue),
                    totalCustomers,
                    recentTransactions: recentTransactions.length
                },
                analytics,
                businesses: businesses // Return all businesses for pagination
            };
        }, 300); // Cache for 5 minutes

        // Apply pagination to recent businesses (after caching)
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
            managersCount: b.managers.length,
            staffCount: b.staff.length
        }));

        // Remove the businesses array from response and add pagination
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
            capacity, // { seating, parking, rooms, area }
            
            // Ratings & Reviews
            ratings, // { average, total, distribution }
            
            // Features & Amenities
            features,
            amenities,
            
            // SEO & Marketing
            seo, // { metaTitle, metaDescription, metaKeywords, ogImage }
            
            // Subscription
            subscription, // { plan, startDate, endDate, features }
            
            // Statistics
            statistics, // { totalCustomers, totalAppointments, totalRevenue, totalOrders, averageRating }
            
            // Notification Preferences
            notificationPreferences, // { email, sms, whatsapp, push }
            
            // Custom Fields
            customFields, // Flexible key-value pairs
            
            // Holidays
            holidays, // [{ name, date }]
            
            // Settings
            settings 
        } = req.body;
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
        
        // Images
        if (images) businessData.images = images;
        
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
        
        // SEO
        if (seo) businessData.seo = seo;
        
        // Subscription
        if (subscription) businessData.subscription = subscription;
        
        // Statistics
        if (statistics) businessData.statistics = statistics;
        
        // Notification Preferences
        if (notificationPreferences) businessData.notificationPreferences = notificationPreferences;
        
        // Custom Fields
        if (customFields) businessData.customFields = customFields;
        
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

        // Invalidate cache
        await deleteCache(`admin:${adminId}:businesses`);
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
                location: business.location, // Include extracted coordinates
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
        const { page = 1, limit = 10, type, search } = req.query;
        const cacheKey = `admin:${adminId}:businesses:${type}:${search}:${page}:${limit}`;

        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        let query = { admin: adminId, isActive: true };

        // Filter by type
        if (type && ['salon', 'spa', 'hotel','restaurant','retail','gym','clinic','cafe','studio','education','automotive','others'].includes(type)) {
            query.type = type;
        }

        // Search by name or branch
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { branch: { $regex: search, $options: 'i' } }
            ];
        }

        const businesses = await Business.find(query)
            .populate('managers', 'name username isActive')
            .populate('staff', 'name role isActive')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Business.countDocuments(query);

        const response = {
            success: true,
            data: businesses.map(business => ({
                id: business._id,
                name: business.name,
                type: business.type,
                branch: business.branch,
                address: business.address,
                city: business.city,
                state: business.state,
                phone: business.phone,
                email: business.email,
                website: business.website,
                businessLink: business.businessLink,
                isActive: business.isActive,
                // NEW: Include location and maps data
                location: business.location,
                googleMapsUrl: business.googleMapsUrl,
                // Include images for display
                images: business.images,
                // Social media links
                socialMedia: business.socialMedia,
                // Counts
                managersCount: business.managers.length,
                staffCount: business.staff.length,
                // Timestamps
                createdAt: business.createdAt,
                updatedAt: business.updatedAt
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

// ================== Get Business by ID ==================
const getBusinessById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        // Validate ID
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Valid Business ID is required" 
            });
        }

        const business = await Business.findOne({ _id: id, admin: adminId })
            .populate('managers', 'name username email phone isActive lastLogin')
            .populate('staff', 'name role phone email isActive')
            .populate('admin', 'name companyName email');

        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        return res.json({ success: true, data: business });
    } catch (err) {
        next(err);
    }
};

// ================== Update Business ==================
const updateBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
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

        // Update business - pre-save hook will extract lat/lng from googleMapsUrl if changed
        const updatedBusiness = await Business.findByIdAndUpdate(
            id, 
            { ...updates, updatedAt: new Date() }, 
            { new: true, runValidators: true }
        ).populate('managers', 'name username email phone isActive');

        // Invalidate cache
        await deleteCache(`admin:${adminId}:businesses`);
        await deleteCache(`admin:${adminId}:dashboard`);

        return res.json({ 
            success: true, 
            message: "Business updated successfully", 
            data: {
                id: updatedBusiness._id,
                name: updatedBusiness.name,
                type: updatedBusiness.type,
                branch: updatedBusiness.branch,
                businessLink: updatedBusiness.businessLink,
                location: updatedBusiness.location,
                googleMapsUrl: updatedBusiness.googleMapsUrl,
                images: updatedBusiness.images,
                socialMedia: updatedBusiness.socialMedia,
                isActive: updatedBusiness.isActive,
                managers: updatedBusiness.managers,
                updatedAt: updatedBusiness.updatedAt
            }
        });
    } catch (err) {
        next(err);
    }
};

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

        // Soft delete - set isActive to false
        await Business.findByIdAndUpdate(id, { isActive: false });

        // Create notification
        await notifyBusinessDeleted(adminId, business.name);

        // Invalidate cache
        await deleteCache(`admin:${adminId}:businesses`);
        await deleteCache(`admin:${adminId}:dashboard`);

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

        // Invalidate cache
        await deleteCache(`admin:${adminId}:businesses`);
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
        const { page = 1, limit = 10, search } = req.query;
        const cacheKey = `admin:${adminId}:managers:${page}:${limit}:${search}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        // Get all businesses for this admin first
        const businesses = await Business.find({ admin: adminId }).select('_id');
        const businessIds = businesses.map(b => b._id);

        let query = { business: { $in: businessIds }, isActive: true };

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

        // Soft delete manager
        await Manager.findByIdAndUpdate(id, { isActive: false });

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
                managersCount: business.managers.length
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

module.exports = {
    getAdminDashboard,
    createBusiness,
    getBusinesses,
    getBusinessById,
    updateBusiness,
    deleteBusiness,
    createManager,
    getManagers,
    getManagerById,
    updateManager,
    deleteManager,
    getBusinessLink,
    getAdminProfile,
    updateAdminProfile,
    updateAdminPassword
};
