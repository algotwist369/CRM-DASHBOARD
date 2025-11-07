// businessController.js - Business-specific operations for managers and admins
const Business = require("../models/Business");
const Staff = require("../models/Staff");
const DailyBusiness = require("../models/DailyBusiness");
const Transaction = require("../models/Transaction");
const { setCache, getCache } = require("../utils/cache");
const { generateBusinessAnalytics } = require("../utils/businessUtils");

// ================== Get All Public Businesses (Public) ==================
const getPublicBusinesses = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, type } = req.query;
        
        const cacheKey = `public:businesses:${page}:${limit}:${search || ''}:${type || ''}`;
        
        // Try cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }
        
        // Build query - only active businesses that allow online booking
        let query = { 
            isActive: true,
            'settings.appointmentSettings.allowOnlineBooking': true
        };
        
        // Filter by type if provided
        if (type && ['salon', 'spa', 'hotel', 'restaurant', 'retail', 'gym', 'clinic', 'cafe', 'studio', 'education', 'automotive', 'others'].includes(type)) {
            query.type = type;
        }
        
        // Search by name, branch, or city
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { branch: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { businessLink: { $regex: search, $options: 'i' } }
            ];
        }
        
        const businesses = await Business.find(query)
            .select('name type branch address city state country phone email website description settings businessLink images socialMedia location googleMapsUrl ratings features amenities category tags createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();
        
        const total = await Business.countDocuments(query);
        
        // Fetch services for all businesses
        const Service = require("../models/Service");
        const businessIds = businesses.map(b => b._id);
        const servicesMap = {};
        
        if (businessIds.length > 0) {
            const services = await Service.find({
                business: { $in: businessIds },
                isActive: true,
                isAvailableOnline: true
            })
                .select('name price duration category business')
                .sort({ displayOrder: 1, name: 1 })
                .lean();
            
            // Group services by business (limit to 5 per business)
            services.forEach(service => {
                if (!servicesMap[service.business]) {
                    servicesMap[service.business] = [];
                }
                if (servicesMap[service.business].length < 5) {
                    servicesMap[service.business].push({
                        name: service.name,
                        price: service.price,
                        duration: service.duration,
                        category: service.category
                    });
                }
            });
        }
        
        // Format businesses for public display
        const formattedBusinesses = businesses.map(business => ({
            id: business._id,
            name: business.name,
            type: business.type,
            branch: business.branch,
            address: business.address,
            city: business.city,
            state: business.state,
            country: business.country,
            phone: business.phone,
            email: business.email,
            website: business.website,
            description: business.description,
            businessLink: business.businessLink,
            // NEW: Location data for maps
            location: business.location,
            googleMapsUrl: business.googleMapsUrl,
            // Images for display
            images: business.images,
            // Social media links
            socialMedia: business.socialMedia,
            // Ratings & reviews
            ratings: business.ratings,
            // Category & tags for filtering
            category: business.category,
            tags: business.tags,
            // Features & amenities
            features: business.features,
            amenities: business.amenities,
            // Services
            services: servicesMap[business._id] || [],
            // Settings
            workingHours: business.settings?.workingHours,
            appointmentSettings: {
                allowOnlineBooking: business.settings?.appointmentSettings?.allowOnlineBooking,
                slotDuration: business.settings?.appointmentSettings?.slotDuration
            }
        }));
        
        const response = {
            success: true,
            data: formattedBusinesses,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        };
        
        // Cache for 5 minutes
        await setCache(cacheKey, response, 300);
        
        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Business Info by Link (Public) ==================
const getBusinessInfoByLink = async (req, res, next) => {
    try {
        const { businessLink } = req.params;
        
        const business = await Business.findOne({ businessLink, isActive: true })
            .select('name type branch address city state country zipCode phone alternatePhone email website description settings businessLink images socialMedia location googleMapsUrl ratings features amenities category subCategory tags specialties capacity paymentMethods')
            .lean();
        
        if (!business) {
            return res.status(404).json({ 
                success: false, 
                message: "Business not found" 
            });
        }
        
        // Return comprehensive public business information
        const businessInfo = {
            id: business._id,
            name: business.name,
            type: business.type,
            branch: business.branch,
            address: business.address,
            city: business.city,
            state: business.state,
            country: business.country,
            zipCode: business.zipCode,
            phone: business.phone,
            alternatePhone: business.alternatePhone,
            email: business.email,
            website: business.website,
            description: business.description,
            businessLink: business.businessLink,
            // Location & Maps
            location: business.location,
            googleMapsUrl: business.googleMapsUrl,
            // Media
            images: business.images,
            socialMedia: business.socialMedia,
            // Ratings & Reviews
            ratings: business.ratings,
            // Category & Tags
            category: business.category,
            subCategory: business.subCategory,
            tags: business.tags,
            specialties: business.specialties,
            // Capacity
            capacity: business.capacity,
            // Features & Amenities
            features: business.features,
            amenities: business.amenities,
            // Payment Methods
            paymentMethods: business.paymentMethods,
            // Settings
            workingHours: business.settings?.workingHours,
            appointmentSettings: business.settings?.appointmentSettings,
            currency: business.settings?.currency,
            timezone: business.settings?.timezone
        };
        
        return res.json({ success: true, data: businessInfo });
    } catch (err) {
        next(err);
    }
};

// ================== Get Business by ID ==================
const getBusinessById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = { _id: id, isActive: true };

        // If user is manager, check if they belong to this business
        if (userRole === 'manager') {
            const manager = await require("../models/Manager").findById(userId);
            if (!manager || manager.business.toString() !== id) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }
        } else if (userRole === 'admin') {
            query.admin = userId;
        }

        const business = await Business.findOne(query)
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

// ================== Get Business Staff ==================
const getBusinessStaff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 10, role, search } = req.query;

        // Verify access
        let hasAccess = false;
        if (userRole === 'admin') {
            const business = await Business.findOne({ _id: id, admin: userId });
            hasAccess = !!business;
        } else if (userRole === 'manager') {
            const manager = await require("../models/Manager").findById(userId);
            hasAccess = manager && manager.business.toString() === id;
        }

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const cacheKey = `business:${id}:staff:${role}:${search}:${page}:${limit}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        let query = { business: id, isActive: true };

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const staff = await Staff.find(query)
            .populate('manager', 'name username')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Staff.countDocuments(query);

        const response = {
            success: true,
            data: staff.map(s => s.toObject()),
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

// ================== Get Business Daily Records ==================
const getBusinessDailyRecords = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { startDate, endDate, page = 1, limit = 10 } = req.query;

        // Verify access
        let hasAccess = false;
        if (userRole === 'admin') {
            const business = await Business.findOne({ _id: id, admin: userId });
            hasAccess = !!business;
        } else if (userRole === 'manager') {
            const manager = await require("../models/Manager").findById(userId);
            hasAccess = manager && manager.business.toString() === id;
        }

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const cacheKey = `business:${id}:daily:${startDate}:${endDate}:${page}:${limit}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        let query = { business: id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const records = await DailyBusiness.find(query)
            .populate('manager', 'name username')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ date: -1 });

        const total = await DailyBusiness.countDocuments(query);

        const response = {
            success: true,
            data: records.map(r => r.toObject()),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        };

        await setCache(cacheKey, response, 300);
        return res.json(response);
    } catch (err) {
        next(err);
    }
};

// ================== Get Business Analytics ==================
const getBusinessAnalytics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { period = 'monthly' } = req.query;

        // Verify access
        let hasAccess = false;
        if (userRole === 'admin') {
            const business = await Business.findOne({ _id: id, admin: userId });
            hasAccess = !!business;
        } else if (userRole === 'manager') {
            const manager = await require("../models/Manager").findById(userId);
            hasAccess = manager && manager.business.toString() === id;
        }

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Set date range based on period
        const endDate = new Date();
        const startDate = new Date();
        
        switch (period) {
            case 'daily':
                startDate.setDate(endDate.getDate() - 1);
                break;
            case 'weekly':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'monthly':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'yearly':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(endDate.getMonth() - 1);
        }

        const dailyRecords = await DailyBusiness.find({
            business: id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 });

        const analytics = generateBusinessAnalytics(dailyRecords, period);

        return res.json({
            success: true,
            data: analytics
        });
    } catch (err) {
        next(err);
    }
};

// ================== Get Businesses Near Location (Public - Geospatial Query) ==================
const getBusinessesNearby = async (req, res, next) => {
    try {
        const { lat, lng, maxDistance = 5000, type, page = 1, limit = 20 } = req.query;

        // ================== Input Validation & Sanitization ==================
        
        // Validate coordinates are provided
        if (!lat || !lng) {
            return res.status(400).json({ 
                success: false, 
                message: "Latitude and longitude are required",
                code: "MISSING_COORDINATES"
            });
        }

        // Parse and validate coordinates
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid latitude or longitude format",
                code: "INVALID_COORDINATES"
            });
        }

        // Validate coordinate ranges
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({ 
                success: false, 
                message: "Latitude must be between -90 and 90",
                code: "INVALID_LATITUDE"
            });
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({ 
                success: false, 
                message: "Longitude must be between -180 and 180",
                code: "INVALID_LONGITUDE"
            });
        }

        // Validate and sanitize maxDistance (100m to 100km)
        const maxDistanceMeters = Math.min(Math.max(parseInt(maxDistance) || 5000, 100), 100000);
        
        // Validate and sanitize pagination
        const pageNumber = Math.max(1, parseInt(page) || 1);
        const limitNumber = Math.min(Math.max(parseInt(limit) || 20, 1), 50); // Max 50 per page
        const skip = (pageNumber - 1) * limitNumber;

        // Validate business type if provided
        const validTypes = ['salon', 'spa', 'hotel', 'restaurant', 'retail', 'gym', 'clinic', 'cafe', 'studio', 'education', 'automotive', 'others'];
        if (type && !validTypes.includes(type)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid business type. Must be one of: ${validTypes.join(', ')}`,
                code: "INVALID_BUSINESS_TYPE"
            });
        }

        // ================== Cache Check ==================
        const cacheKey = `nearby:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${maxDistanceMeters}:${type || 'all'}:${pageNumber}:${limitNumber}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ 
                success: true, 
                source: "cache",
                ...cachedData 
            });
        }

        // ================== Build Query ==================
        const baseQuery = {
            isActive: true,
            'settings.appointmentSettings.allowOnlineBooking': true,
            location: {
                $exists: true,
                $ne: null
            }
        };

        if (type) {
            baseQuery.type = type;
        }

        // ================== Geospatial Aggregation Pipeline ==================
        const pipeline = [
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    distanceField: "distance",
                    maxDistance: maxDistanceMeters,
                    spherical: true,
                    query: baseQuery
                }
            },
            {
                $project: {
                    name: 1,
                    type: 1,
                    branch: 1,
                    address: 1,
                    city: 1,
                    state: 1,
                    country: 1,
                    phone: 1,
                    email: 1,
                    website: 1,
                    description: 1,
                    businessLink: 1,
                    location: 1,
                    googleMapsUrl: 1,
                    images: 1,
                    socialMedia: 1,
                    ratings: 1,
                    category: 1,
                    tags: 1,
                    features: 1,
                    amenities: 1,
                    'settings.workingHours': 1,
                    'settings.appointmentSettings': 1,
                    distance: 1
                }
            },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limitNumber }
                    ],
                    metadata: [
                        { $count: "total" }
                    ]
                }
            }
        ];

        // ================== Execute Query ==================
        let result;
        try {
            result = await Business.aggregate(pipeline).allowDiskUse(true); // Allow disk use for large datasets
        } catch (aggregateError) {
            // Handle geospatial index errors gracefully
            if (aggregateError.message && aggregateError.message.includes('geoNear')) {
                console.error('Geospatial query error:', aggregateError.message);
                return res.status(503).json({
                    success: false,
                    message: "Location-based search is temporarily unavailable. Please try again later.",
                    code: "GEOSPATIAL_ERROR"
                });
            }
            throw aggregateError;
        }

        // ================== Process Results ==================
        const businesses = result[0]?.data || [];
        const total = result[0]?.metadata?.[0]?.total || 0;

        // Fetch services for all businesses
        const Service = require("../models/Service");
        const businessIds = businesses.map(b => b._id);
        const servicesMap = {};
        
        if (businessIds.length > 0) {
            const services = await Service.find({
                business: { $in: businessIds },
                isActive: true,
                isAvailableOnline: true
            })
                .select('name price duration category business')
                .sort({ displayOrder: 1, name: 1 })
                .lean();
            
            // Group services by business (limit to 5 per business)
            services.forEach(service => {
                if (!servicesMap[service.business]) {
                    servicesMap[service.business] = [];
                }
                if (servicesMap[service.business].length < 5) {
                    servicesMap[service.business].push({
                        name: service.name,
                        price: service.price,
                        duration: service.duration,
                        category: service.category
                    });
                }
            });
        }

        // Format businesses for response
        const formattedBusinesses = businesses.map(business => {
            const distance = business.distance || 0;
            return {
                id: business._id,
                name: business.name,
                type: business.type,
                branch: business.branch,
                address: business.address,
                city: business.city,
                state: business.state,
                country: business.country,
                phone: business.phone,
                email: business.email,
                website: business.website,
                description: business.description,
                businessLink: business.businessLink,
                location: business.location,
                googleMapsUrl: business.googleMapsUrl,
                images: business.images,
                socialMedia: business.socialMedia,
                ratings: business.ratings || { average: 0, totalReviews: 0 },
                category: business.category,
                tags: business.tags || [],
                features: business.features || [],
                amenities: business.amenities || [],
                services: servicesMap[business._id] || [],
                workingHours: business.settings?.workingHours,
                appointmentSettings: {
                    allowOnlineBooking: business.settings?.appointmentSettings?.allowOnlineBooking,
                    slotDuration: business.settings?.appointmentSettings?.slotDuration
                },
                distance: Math.round(distance),
                distanceKm: parseFloat((distance / 1000).toFixed(2))
            };
        });

        // ================== Build Response ==================
        const response = {
            success: true,
            data: formattedBusinesses,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber),
                hasMore: skip + limitNumber < total
            },
            searchLocation: {
                latitude,
                longitude,
                maxDistance: maxDistanceMeters,
                maxDistanceKm: parseFloat((maxDistanceMeters / 1000).toFixed(2))
            },
            meta: {
                resultsCount: formattedBusinesses.length,
                searchRadius: `${(maxDistanceMeters / 1000).toFixed(1)} km`
            }
        };

        // ================== Cache Response ==================
        // Cache for 5 minutes (300 seconds) - matches backend cache duration
        await setCache(cacheKey, response, 300);

        return res.json(response);

    } catch (err) {
        // Enhanced error logging for production
        console.error('[getBusinessesNearby] Error:', {
            message: err.message,
            stack: err.stack,
            query: req.query,
            timestamp: new Date().toISOString()
        });

        // Handle specific MongoDB errors
        if (err.name === 'MongoError' || err.name === 'MongoServerError') {
            if (err.message && err.message.includes('geoNear')) {
                return res.status(503).json({
                    success: false,
                    message: "Location-based search is temporarily unavailable. Please try again later.",
                    code: "GEOSPATIAL_SERVICE_UNAVAILABLE"
                });
            }
        }

        // Generic error response
        next(err);
    }
};

// ================== Update Business (Admin + Manager shared endpoint) ==================
const updateBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        let business;
        let businessId = id;

        // Check access based on role
        if (userRole === 'admin') {
            // Admin can update any of their businesses
            business = await Business.findOne({ _id: id, admin: userId });
            if (!business) {
                return res.status(404).json({ success: false, message: "Business not found or access denied" });
            }
        } else if (userRole === 'manager') {
            // Manager can only update their own business
            const manager = await require("../models/Manager").findById(userId);
            if (!manager) {
                return res.status(404).json({ success: false, message: "Manager not found" });
            }
            
            // If no ID provided, update manager's own business
            if (!id || id === 'mine') {
                businessId = manager.business.toString();
            }

            business = await Business.findById(businessId);
            if (!business || business._id.toString() !== manager.business.toString()) {
                return res.status(403).json({ success: false, message: "Access denied: You can only update your own business" });
            }

            // Managers cannot change certain fields
            delete updates.admin;
            delete updates.isActive;
            delete updates.businessLink;
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
            businessId, 
            { ...updates, updatedAt: new Date() }, 
            { new: true, runValidators: true }
        ).populate('managers', 'name username email phone isActive');

        if (!updatedBusiness) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        // Invalidate relevant caches
        if (userRole === 'admin') {
            const { deleteCache } = require("../utils/cache");
            await deleteCache(`admin:${userId}:businesses`);
            await deleteCache(`admin:${userId}:dashboard`);
        } else if (userRole === 'manager') {
            const { deleteCache } = require("../utils/cache");
            await deleteCache(`manager:${userId}:dashboard`);
            await deleteCache(`business:${businessId}:info`);
        }

        return res.json({ 
            success: true, 
            message: "Business updated successfully", 
            data: {
                id: updatedBusiness._id,
                name: updatedBusiness.name,
                type: updatedBusiness.type,
                branch: updatedBusiness.branch,
                address: updatedBusiness.address,
                city: updatedBusiness.city,
                state: updatedBusiness.state,
                phone: updatedBusiness.phone,
                email: updatedBusiness.email,
                website: updatedBusiness.website,
                businessLink: updatedBusiness.businessLink,
                location: updatedBusiness.location,
                googleMapsUrl: updatedBusiness.googleMapsUrl,
                images: updatedBusiness.images,
                socialMedia: updatedBusiness.socialMedia,
                registration: updatedBusiness.registration,
                category: updatedBusiness.category,
                subCategory: updatedBusiness.subCategory,
                tags: updatedBusiness.tags,
                features: updatedBusiness.features,
                amenities: updatedBusiness.amenities,
                paymentMethods: updatedBusiness.paymentMethods,
                bankDetails: updatedBusiness.bankDetails,
                capacity: updatedBusiness.capacity,
                settings: updatedBusiness.settings,
                isActive: updatedBusiness.isActive,
                managers: updatedBusiness.managers,
                updatedAt: updatedBusiness.updatedAt
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getPublicBusinesses,
    getBusinessInfoByLink,
    getBusinessById,
    getBusinessStaff,
    getBusinessDailyRecords,
    getBusinessAnalytics,
    getBusinessesNearby,
    updateBusiness
};
