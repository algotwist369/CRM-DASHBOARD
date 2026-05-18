// businessController.js - Business-specific operations for managers and admins
const Business = require("../models/Business");
const Review = require("../models/Review");
const mongoose = require("mongoose");

// Fetch services for all businesses
const Service = require("../models/Service");


// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
    if (!id || id === 'undefined' || id === 'null') {
        return false;
    }
    return mongoose.Types.ObjectId.isValid(id);
};
const Staff = require("../models/Staff");
const DailyBusiness = require("../models/DailyBusiness");
const { setCache, getCache } = require("../utils/cache");
const { generateBusinessAnalytics } = require("../utils/businessUtils");
const indiaLocations = require("../data/indiaLocations");
const { encryptResponse } = require("../utils/encryptionUtils");
// const googlePlaces = require("../utils/googlePlaces");
const { parseJsonFields, handleBusinessImages } = require("../utils/fileHandler");

// Pre-compute known locations for fast lookup
const knownLocations = new Set();
// Initialize knownLocations
(function initKnownLocations() {
    if (Array.isArray(indiaLocations)) {
        indiaLocations.forEach(loc => {
            if (loc.state) knownLocations.add(loc.state.toLowerCase());
            if (loc.cities && Array.isArray(loc.cities)) {
                loc.cities.forEach(city => knownLocations.add(city.toLowerCase()));
            }
        });
    }
})();

const isKnownLocation = (text) => {
    if (!text) return false;
    const clean = text.trim().toLowerCase();
    if (knownLocations.has(clean)) return true;
    const parts = clean.split(',').map(p => p.trim());
    return parts.some(p => knownLocations.has(p));
};


// ===========================================
//              PUBLIC CONTROLLERS  
// ===========================================

// ================== Get All Public Businesses (Public) ==================
const getPublicBusinesses = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            type,
            cursor
        } = req.query;

        const limitNumber = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
        const pageNumber = Math.max(1, parseInt(page) || 1);
        const useCursor = Boolean(cursor);

        let cursorDate = null;
        if (cursor) {
            const parsedDate = new Date(cursor);
            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid cursor value. Please provide a valid ISO date string.",
                    code: "INVALID_CURSOR"
                });
            }
            cursorDate = parsedDate;
        }

        const cacheKey = useCursor
            ? `public:businesses:v2:cursor:${cursor || 'start'}:${limitNumber}:${search || ''}:${type || ''}`
            : `public:businesses:v2:page:${pageNumber}:${limitNumber}:${search || ''}:${type || ''}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.json({ success: true, source: "cache", ...cachedData });
        }

        const baseQuery = {
            isActive: true,
            'settings.appointmentSettings.allowOnlineBooking': true
        };

        if (type && ['salon', 'spa', 'hotel', 'restaurant', 'retail', 'gym', 'clinic', 'cafe', 'studio', 'education', 'automotive', 'others'].includes(type)) {
            baseQuery.type = type;
        }

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            baseQuery.$or = [
                { name: searchRegex },
                { branch: searchRegex },
                { city: searchRegex },
                { state: searchRegex },
                { address: searchRegex },
                { category: searchRegex },
                { businessLink: searchRegex },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const query = { ...baseQuery };
        if (cursorDate) {
            query.createdAt = { $lt: cursorDate };
        }

        const skip = useCursor ? 0 : (pageNumber - 1) * limitNumber;

        const businesses = await Business.find(query)
            .select('name type branch address city state country phone email website description settings businessLink images google360ImageUrl videos socialMedia location googleMapsUrl ratings features amenities category tags createdAt seo')
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean();

        const Service = require("../models/Service");
        const businessIds = businesses.map(b => b._id);
        const servicesMap = {};

        if (businessIds.length > 0) {
            const services = await Service.find({
                business: { $in: businessIds },
                isActive: true,
                isAvailableOnline: true
            })
                .select('name price duration category business pricingOptions')
                .sort({ displayOrder: 1, name: 1 })
                .lean();

            // Use helper function to get price and duration (handles both old and new format)
            const { getServicePriceAndDuration } = require("../utils/appointmentUtils");

            services.forEach(service => {
                if (!servicesMap[service.business]) {
                    servicesMap[service.business] = [];
                }
                if (servicesMap[service.business].length < 5) {
                    const { price, duration } = getServicePriceAndDuration(service);
                    servicesMap[service.business].push({
                        name: service.name,
                        price: price,
                        duration: duration,
                        category: service.category,
                        pricingOptions: service.pricingOptions || null // Include pricingOptions if available
                    });
                }
            });
        }

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
            location: business.location,
            googleMapsUrl: business.googleMapsUrl,
            images: business.images,
            socialMedia: business.socialMedia,
            ratings: business.ratings,
            category: business.category,
            tags: business.tags,
            features: business.features,
            amenities: business.amenities,
            services: servicesMap[business._id] || [],
            workingHours: business.settings?.workingHours,
            appointmentSettings: {
                allowOnlineBooking: business.settings?.appointmentSettings?.allowOnlineBooking,
                slotDuration: business.settings?.appointmentSettings?.slotDuration
            },
            seo: business.seo,
            createdAt: business.createdAt
        }));

        let total = null;
        if (!useCursor) {
            total = await Business.countDocuments(baseQuery);
        }

        const lastBusiness = formattedBusinesses[formattedBusinesses.length - 1];
        const nextCursor = lastBusiness
            ? {
                cursor: lastBusiness.createdAt?.toISOString?.() || new Date().toISOString(),
                cursorId: lastBusiness.id
            }
            : null;

        const response = {
            businesses: formattedBusinesses,
            pagination: useCursor
                ? null
                : {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    pages: total ? Math.ceil(total / limitNumber) : null,
                    hasMore: total ? pageNumber * limitNumber < total : false
                },
            cursorPagination: {
                cursor: cursorDate ? cursorDate.toISOString() : null,
                limit: limitNumber,
                nextCursor: formattedBusinesses.length === limitNumber ? nextCursor : null,
                hasMore: formattedBusinesses.length === limitNumber
            }
        };

        // Simple obfuscation/encryption function
        // Uses shared utility

        const secureResponse = {
            success: true,
            message: "Fetched successfully",
            payload: encryptResponse(response)
        };

        console.log('[searchBusinesses] Search completed successfully', {
            resultsCount: formattedBusinesses.length,
            totalResults: total,
            page: pageNumber,
            limit: limitNumber,
            timestamp: new Date().toISOString()
        });

        // Cache the secure response
        await setCache(cacheKey, secureResponse, 300);

        return res.json(secureResponse);
    } catch (err) {
        next(err);
    }
};

// ================== Get Business Info by Link (Public) ==================
const getBusinessInfoByLink = async (req, res, next) => {
    try {
        const { businessLink } = req.params;

        const business = await Business.findOne({ businessLink, isActive: true })
            .select('name type branch address city state country zipCode phone alternatePhone email website description settings businessLink images google360ImageUrl videos socialMedia location googleMapsUrl ratings features amenities category subCategory tags specialties capacity paymentMethods seo')
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
            timezone: business.settings?.timezone,
            seo: business.seo
        };

        return res.json({ success: true, data: businessInfo });
    } catch (err) {
        next(err);
    }
};

// ================== Get Businesses Near Location (Public - Geospatial Query) ==================
const getBusinessesNearby = async (req, res, next) => {
    try {
        const {
            lat,
            lng,
            maxDistance = 5000,
            type,
            page = 1,
            limit = 20,
            cursorDistance,
            cursorId
        } = req.query;

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

        const parsedCursorDistance = cursorDistance !== undefined ? parseFloat(cursorDistance) : null;
        const hasCursorDistance = typeof parsedCursorDistance === 'number' && !Number.isNaN(parsedCursorDistance) && parsedCursorDistance >= 0;
        const cursorObjectId = cursorId && mongoose.Types.ObjectId.isValid(cursorId) ? new mongoose.Types.ObjectId(cursorId) : null;
        const useCursor = hasCursorDistance || !!cursorObjectId;

        const skip = useCursor ? 0 : (pageNumber - 1) * limitNumber;

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
        const cacheKey = useCursor
            ? `nearby:v2:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${maxDistanceMeters}:${type || 'all'}:cursor:${hasCursorDistance ? parsedCursorDistance : 'none'}:${cursorObjectId || 'none'}:${limitNumber}`
            : `nearby:v2:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${maxDistanceMeters}:${type || 'all'}:page:${pageNumber}:${limitNumber}`;
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
                    google360ImageUrl: 1,
                    videos: 1,
                    socialMedia: 1,
                    ratings: 1,
                    category: 1,
                    tags: 1,
                    features: 1,
                    amenities: 1,
                    'settings.workingHours': 1,
                    'settings.appointmentSettings': 1,
                    distance: 1,
                    seo: 1
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

        if (useCursor) {
            if (hasCursorDistance && cursorObjectId) {
                pipeline.push({
                    $match: {
                        $or: [
                            { distance: { $gt: parsedCursorDistance } },
                            { distance: parsedCursorDistance, _id: { $gt: cursorObjectId } }
                        ]
                    }
                });
            } else if (hasCursorDistance) {
                pipeline.push({
                    $match: { distance: { $gt: parsedCursorDistance } }
                });
            } else if (cursorObjectId) {
                pipeline.push({
                    $match: { _id: { $gt: cursorObjectId } }
                });
            }
        }

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
        const total = useCursor ? null : (result[0]?.metadata?.[0]?.total || 0);

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
                .select('name price duration category business pricingOptions')
                .sort({ displayOrder: 1, name: 1 })
                .lean();

            // Use helper function to get price and duration (handles both old and new format)
            const { getServicePriceAndDuration } = require("../utils/appointmentUtils");

            // Group services by business (limit to 5 per business)
            services.forEach(service => {
                if (!servicesMap[service.business]) {
                    servicesMap[service.business] = [];
                }
                if (servicesMap[service.business].length < 5) {
                    const { price, duration } = getServicePriceAndDuration(service);
                    servicesMap[service.business].push({
                        name: service.name,
                        price: price,
                        duration: duration,
                        category: service.category,
                        pricingOptions: service.pricingOptions || null // Include pricingOptions if available
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
                distanceKm: parseFloat((distance / 1000).toFixed(2)),
                distanceMeters: distance,
                seo: business.seo
            };
        });

        // ================== Build Response ==================
        const lastBusiness = formattedBusinesses[formattedBusinesses.length - 1];
        const nextCursor = lastBusiness
            ? {
                cursorDistance: lastBusiness.distanceMeters,
                cursorId: lastBusiness.id
            }
            : null;

        const response = {
            success: true,
            data: formattedBusinesses,
            pagination: useCursor
                ? null
                : {
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
            },
            cursorPagination: {
                cursorDistance: hasCursorDistance ? parsedCursorDistance : null,
                cursorId: cursorObjectId ? cursorObjectId.toString() : null,
                limit: limitNumber,
                nextCursor: formattedBusinesses.length === limitNumber ? nextCursor : null,
                hasMore: formattedBusinesses.length === limitNumber
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

const searchBusinesses = async (req, res, next) => {
    try {
        const {
            q,
            location,
            category,
            minRating,
            minPrice,
            maxPrice,
            service,
            offers,
            sort,
            businessLink,
            page = 1,
            limit = 20
        } = req.query;

        const debugInfo = {
            queryParams: { q, location, category, minRating, minPrice, maxPrice, service, offers, sort, page, limit },
            timestamp: new Date().toISOString()
        };
        console.log('[searchBusinesses] Starting search:', debugInfo);

        const pageNum = parseInt(page) || 1;
        const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

        // --- CACHE LAYER ---
        const cacheKey = `search:${JSON.stringify({ q, location, category, minRating, minPrice, maxPrice, service, offers, sort, page, limit })}`;
        try {
            const cachedData = await getCache(cacheKey);
            if (cachedData) {
                console.log('[searchBusinesses] Serving from cache:', cacheKey);
                return res.json({
                    success: true,
                    message: "Fetched successfully (cached)",
                    source: "cache",
                    payload: encryptResponse(cachedData)
                });
            }
        } catch (cacheError) {
            console.warn('[searchBusinesses] Cache retrieval failed:', cacheError.message);
        }

        let hasLocationFilter = !!location;
        let searchQuery = q;

        if (hasLocationFilter && !searchQuery && !category && !minRating) {
            const isLoc = isKnownLocation(location);
            if (!isLoc) {
                searchQuery = location;
                hasLocationFilter = false;
            }
        }

        const matchConditions = [
            { isActive: true },
            { 'settings.appointmentSettings.allowOnlineBooking': true }
        ];

        // 1. Text Query Search (Regex based)
        if (q && q !== businessLink) {
            const keywords = q.trim().split(/\s+/).filter(k => k.length > 0);
            if (keywords.length > 0) {
                const orConditions = keywords.map(keyword => ({
                    $or: [
                        { name: { $regex: keyword, $options: 'i' } },
                        { branch: { $regex: keyword, $options: 'i' } },
                        { city: { $regex: keyword, $options: 'i' } },
                        { type: { $regex: keyword, $options: 'i' } },
                        { businessLink: { $regex: keyword, $options: 'i' } }
                    ]
                }));
                matchConditions.push({ $and: orConditions });
            }
        }

        // 2. Location Search
        if (location && location !== 'all') {
            const loc = location.trim();
            matchConditions.push({
                $or: [
                    { city: { $regex: loc, $options: 'i' } },
                    { state: { $regex: loc, $options: 'i' } },
                    { branch: { $regex: loc, $options: 'i' } },
                    { address: { $regex: loc, $options: 'i' } }
                ]
            });
        }

        // 3. Category Filter
        if (category) {
            matchConditions.push({ type: { $regex: category, $options: 'i' } });
        }

        // 4. Rating Filter
        if (minRating && !isNaN(parseFloat(minRating))) {
            matchConditions.push({ 'ratings.average': { $gte: parseFloat(minRating) } });
        }

        // 5. Offers Filter
        if (offers === 'true') {
            matchConditions.push({ 'offers': { $exists: true, $ne: [] } });
        }

        // 6. Business Link (Specific Business)
        if (businessLink) {
            matchConditions.push({
                $or: [
                    { businessLink: businessLink },
                    { name: { $regex: businessLink.replace(/[-_]/g, ' '), $options: 'i' } }
                ]
            });
        }

        const pipeline = [
            { $match: { $and: matchConditions } }
        ];

        pipeline.push({
            $lookup: {
                from: "services",
                let: { businessId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$business", "$$businessId"] },
                            isActive: true,
                            isAvailableOnline: true
                        }
                    },
                    { $limit: 5 },
                    { $project: { name: 1, price: 1 } }
                ],
                as: "serviceDetails"
            }
        });

        if (service) {
            pipeline.push({
                $match: {
                    "serviceDetails.name": { $regex: service, $options: "i" }
                }
            });
        }

        if (minPrice || maxPrice) {
            const priceCondition = {};
            if (minPrice) priceCondition.$gte = Number(minPrice);
            if (maxPrice) priceCondition.$lte = Number(maxPrice);
            pipeline.push({
                $match: {
                    "serviceDetails.price": priceCondition
                }
            });
        }

        pipeline.push({
            $project: {
                name: 1,
                type: 1,
                branch: 1,
                address: 1,
                city: 1,
                state: 1,
                location: 1,
                images: 1,
                image: { $ifNull: ["$images.thumbnail", { $ifNull: ["$images.logo", { $ifNull: ["$images.banner", null] }] }] },
                ratings: 1,
                category: 1,
                tags: 1,
                description: 1,
                phone: 1,
                socialMedia: 1,
                businessLink: 1,
                snippet: { $concat: [{ $substrCP: [{ $ifNull: ["$description", ""] }, 0, 150] }, "..."] },
                serviceDetails: 1,
                offers: 1,
                createdAt: 1
            }
        });

        let sortStage = {};
        if (sort === 'rating') {
            sortStage['ratings.average'] = -1;
            sortStage['ratings.totalReviews'] = -1;
        } else {
            sortStage['ratings.average'] = -1;
            sortStage.createdAt = -1;
        }

        pipeline.push({ $sort: sortStage });

        pipeline.push({
            $facet: {
                results: [
                    { $skip: (pageNum - 1) * limitNum },
                    { $limit: limitNum }
                ],
                totalCount: [{ $count: "count" }]
            }
        });

        const result = await Business.aggregate(pipeline);
        const businesses = result[0]?.results || [];
        const totalResults = result[0]?.totalCount[0]?.count || 0;

        const formattedResults = businesses.map(b => {
            const formattedServices = (b.serviceDetails || []).map(s => ({ name: s.name, price: s.price }));

            return {
                id: b._id,
                name: b.name,
                type: b.type,
                branch: b.branch,
                address: b.address,
                city: b.city,
                state: b.state,
                category: b.category,
                tags: b.tags,
                ratings: b.ratings,
                image: b.image || b.images?.thumbnail || b.images?.logo,
                gallery: b.images?.gallery || [],
                snippet: b.snippet,
                location: b.location,
                phone: b.phone,
                socialMedia: b.socialMedia,
                services: formattedServices,
                offers: b.offers || [],
                businessLink: b.businessLink,
                seo: b.seo
            };
        });

        const responseData = {
            page: pageNum,
            limit: limitNum,
            totalResults,
            results: formattedResults
        };

        const secureResponse = {
            success: true,
            message: "Fetched successfully",
            payload: encryptResponse(responseData)
        };

        // Cache the result for 5 minutes
        try {
            await setCache(cacheKey, responseData, 300);
        } catch (cacheError) {
            console.warn('[searchBusinesses] Cache storage failed:', cacheError.message);
        }

        console.log('[searchBusinesses] Search completed successfully', {
            resultsCount: formattedResults.length,
            totalResults,
            page: pageNum,
            limit: limitNum,
            timestamp: new Date().toISOString()
        });

        return res.json(secureResponse);

    } catch (err) {
        console.error('[searchBusinesses] Error:', {
            message: err.message,
            stack: err.stack,
            queryParams: req.query
        });
        next(err);
    }
};

const autocompleteSuggestions = async (req, res, next) => {
    try {
        const { q, limit = 10 } = req.query;
        console.log('[autocompleteSuggestions] Starting autocomplete:', { q, limit, timestamp: new Date().toISOString() });

        if (!q || q.trim().length < 2) {
            console.log('[autocompleteSuggestions] Query too short, returning empty results');
            return res.json({
                success: true,
                data: []
            });
        }

        const searchText = q.trim();
        const limitNum = Math.min(Math.max(parseInt(limit), 1), 20);

        // --- CACHE LAYER ---
        const cacheKey = `autocomplete:${searchText}:${limitNum}`;
        try {
            const cachedData = await getCache(cacheKey);
            if (cachedData) {
                return res.json({
                    success: true,
                    source: "cache",
                    data: cachedData
                });
            }
        } catch (cacheError) {
            console.warn('[autocompleteSuggestions] Cache retrieval failed:', cacheError.message);
        }

        // Simple database search by name
        const suggestions = await Business.find({
            isActive: true,
            name: { $regex: searchText, $options: 'i' }
        })
        .select('name branch city state type category businessLink')
        .limit(limitNum)
        .lean();

        console.log('[autocompleteSuggestions] Autocomplete completed successfully', {
            searchText,
            suggestionsFound: suggestions.length,
            timestamp: new Date().toISOString()
        });

        // Cache for 10 minutes
        try {
            await setCache(cacheKey, suggestions, 600);
        } catch (cacheError) {
            console.warn('[autocompleteSuggestions] Cache storage failed:', cacheError.message);
        }

        return res.json({
            success: true,
            data: suggestions
        });

    } catch (err) {
        console.error('[autocompleteSuggestions] Error:', {
            message: err.message,
            stack: err.stack,
            queryParams: { q, limit }
        });
        next(err);
    }
};

const getIndiaLocations = async (req, res, next) => {
    try {
        const { search = "", state = "" } = req.query;
        const normalizedSearch = search.trim().toLowerCase();
        const normalizedState = state.trim().toLowerCase();

        const states = indiaLocations
            .map((entry) => {
                const stateMatches = entry.state.toLowerCase().includes(normalizedState);
                const cities = entry.cities.filter((city) => {
                    if (!normalizedSearch) return true;
                    return (
                        city.toLowerCase().includes(normalizedSearch) ||
                        entry.state.toLowerCase().includes(normalizedSearch)
                    );
                });

                if (normalizedState && !stateMatches && cities.length === 0) {
                    return null;
                }

                if (normalizedSearch && cities.length === 0 && !entry.state.toLowerCase().includes(normalizedSearch)) {
                    return null;
                }

                return {
                    state: entry.state,
                    stateCode: entry.stateCode,
                    cities
                };
            })
            .filter(Boolean)
            .filter((entry) => entry.cities.length > 0);

        const flattenedLocations = states.flatMap((entry) =>
            entry.cities.map((city) => ({
                state: entry.state,
                stateCode: entry.stateCode,
                city
            }))
        );

        // Encryption logic
        // Uses shared utility

        const responseData = {
            totalStates: indiaLocations.length,
            matchedStates: states.length,
            totalCities: flattenedLocations.length,
            states,
            locations: flattenedLocations
        };

        return res.json({
            success: true,
            message: "Fetched successfully",
            payload: encryptResponse(responseData)
        });
    } catch (error) {
        next(error);
    }
};

// ===========================================
//              ADMIN & MANAGER  
// ===========================================

// ================== Get Business by ID ==================
const getBusinessById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Validate ID
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid Business ID is required"
            });
        }

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

        // Import Models locally if not top-level to avoid circular dependency risks or just ensuring availability
        const Transaction = require("../models/Transaction");
        const Appointment = require("../models/Appointment");

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

        // Adjust dates to cover full days
        endDate.setHours(23, 59, 59, 999);
        startDate.setHours(0, 0, 0, 0);

        let daysInPeriod = 30; // Default

        switch (period) {
            case 'daily':
                startDate.setDate(endDate.getDate() - 1); // Last 24h effectively? Or today? Usually means "Today" or "Yesterday"
                // User logic was -1 day. Let's keep consistent but ensure ranges.
                daysInPeriod = 1;
                break;
            case 'weekly':
                startDate.setDate(endDate.getDate() - 7);
                daysInPeriod = 7;
                break;
            case 'monthly':
                startDate.setMonth(endDate.getMonth() - 1);
                daysInPeriod = 30;
                break;
            case 'yearly':
                startDate.setFullYear(endDate.getFullYear() - 1);
                daysInPeriod = 365;
                break;
            case 'all':
                startDate.setTime(0); // Beginning of time
                // Calculate days since business creation for accurate averages
                const biz = await Business.findById(id).select('createdAt');
                if (biz && biz.createdAt) {
                    const diffTime = Math.abs(endDate - new Date(biz.createdAt));
                    daysInPeriod = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
                } else {
                    daysInPeriod = 365; // Fallback
                }
                break;
            default:
                startDate.setMonth(endDate.getMonth() - 1);
        }

        // Get Daily Records (for granular trends if available)
        const dailyRecords = await DailyBusiness.find({
            business: id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 });

        // Generate Base Analytics
        const analytics = generateBusinessAnalytics(dailyRecords, period);

        // =========================================================================
        // OVERRIDE WITH HYBRID REAL-TIME STATS (To Match Manager Dashboard)
        // =========================================================================

        // Construct Match Queries
        const txnMatch = {
            business: new mongoose.Types.ObjectId(id),
            paymentStatus: 'completed',
            isRefunded: false
        };

        const apptMatch = {
            business: new mongoose.Types.ObjectId(id),
            status: 'completed'
        };

        // Apply Date Filter ONLY if NOT 'all' time
        if (period !== 'all') {
            txnMatch.transactionDate = { $gte: startDate, $lte: endDate };
            apptMatch.appointmentDate = { $gte: startDate, $lte: endDate };
        }

        // 1. Transactions Revenue & Count
        const txnStats = await Transaction.aggregate([
            { $match: txnMatch },
            { $group: { _id: null, total: { $sum: "$finalPrice" }, count: { $sum: 1 }, customers: { $sum: 1 } } } // Approx customers count
        ]);

        const txnRevenue = txnStats[0]?.total || 0;
        const txnCount = txnStats[0]?.count || 0;
        // txnCustomers is approximation, we usually just sum counts for "Total Customers" metric in this hybrid model

        // 2. Missing Appointments (Ghost Revenue)
        const apptStats = await Appointment.aggregate([
            { $match: apptMatch },
            {
                $lookup: {
                    from: "transactions",
                    localField: "_id",
                    foreignField: "appointment",
                    as: "existingTxn"
                }
            },
            { $match: { existingTxn: { $size: 0 } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        const apptRevenue = apptStats[0]?.total || 0;
        const apptCount = apptStats[0]?.count || 0;

        // 3. Update Analytics Object
        const totalHybridRevenue = txnRevenue + apptRevenue;
        const totalHybridCustomers = txnCount + apptCount; // Matches "Total Customers" logic in manager dashboard (Total Interactions)

        analytics.totalRevenue = totalHybridRevenue;
        analytics.totalCustomers = totalHybridCustomers;

        // Recalculate Averages
        analytics.averageDailyRevenue = analytics.totalRevenue / Math.max(daysInPeriod, 1);
        analytics.averageDailyCustomers = analytics.totalCustomers / Math.max(daysInPeriod, 1);

        // Update Net Profit (assuming expenses from DailyBusiness are still best source for expenses)
        // Profit = Hybrid Revenue - Reported Expenses
        analytics.netProfit = analytics.totalRevenue - analytics.totalExpenses;

        return res.json({
            success: true,
            data: analytics
        });
    } catch (err) {
        next(err);
    }
};

// ================== Update Business (Admin + Manager shared endpoint) ==================
const updateBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = parseJsonFields(req.body);
        const userId = req.user.id;
        const userRole = req.user.role;

        let business;
        let businessId = id;

        // Validate ID for admin
        if (userRole === 'admin') {
            if (!id || !isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid Business ID is required"
                });
            }
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

            // Validate businessId before query
            if (!businessId || !isValidObjectId(businessId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid Business ID is required"
                });
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

        // Handle Images if files are uploaded or URLs are updated
        if (req.files && Object.keys(req.files).length > 0 || updates.images) {
            updates.images = await handleBusinessImages(req.files, updates.images || {}, business.images || {});
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

        // Apply updates to the business object with deep merge
        Object.keys(updates).forEach(key => {
            if (updates[key] && typeof updates[key] === 'object' && !Array.isArray(updates[key]) && business[key]) {
                // For nested objects (like settings, seo, etc.), use deep merge
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

// ================== Add Business Review (Public) ==================
const addBusinessReview = async (req, res, next) => {
    try {
        const { id } = req.params; // Business ID
        const { name, email, rating, review } = req.body;

        // validation
        if (!name || !email || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: name, email, rating, review"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        // Create the review
        const newReview = await Review.create({
            business: id,
            guestName: name,
            guestEmail: email,
            rating: Number(rating),
            review: review,
            isPublished: true, // Auto-publish for now
            status: 'approved',
            source: 'website'
        });

        // Update Business Ratings
        const ratingField = ['oneStar', 'twoStars', 'threeStars', 'fourStars', 'fiveStars'][Math.round(rating) - 1];

        // Use atomic update for counts
        const incUpdate = {
            'ratings.totalReviews': 1
        };
        if (ratingField) {
            incUpdate[`ratings.${ratingField}`] = 1;
        }

        await Business.findByIdAndUpdate(id, { $inc: incUpdate });

        // Recalculate average
        const updatedBusiness = await Business.findById(id).select('ratings');
        const r = updatedBusiness.ratings;
        const totalStars = (r.fiveStars * 5) + (r.fourStars * 4) + (r.threeStars * 3) + (r.twoStars * 2) + (r.oneStar * 1);
        const newAverage = r.totalReviews > 0 ? totalStars / r.totalReviews : 0;

        await Business.findByIdAndUpdate(id, { 'ratings.average': newAverage });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: newReview
        });

    } catch (err) {
        next(err);
    }
};

// ================== Get Business Reviews (Public) ==================
const getBusinessReviews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Default limit 20
        const skip = (page - 1) * limit;

        // Fetch reviews with pagination
        const reviews = await Review.find({
            business: id,
            isPublished: true
        })
            .select('guestName guestEmail rating review createdAt helpfulCount notHelpfulCount') // Added helpful counts
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Review.countDocuments({ business: id, isPublished: true });

        // Secure response by masking email
        const securedData = {
            reviews: reviews.map(review => ({
                _id: review._id,
                guestName: review.guestName,
                // guestEmail removed for security
                rating: review.rating,
                review: review.review,
                createdAt: review.createdAt,
                helpfulPercentage: (review.helpfulCount + review.notHelpfulCount) > 0
                    ? Math.round((review.helpfulCount / (review.helpfulCount + review.notHelpfulCount)) * 100)
                    : 0
            })),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                hasMore: (page * limit) < total
            }
        };

        // Simple obfuscation/encryption function for the response
        // This hides the data in the network tab as requested
        // Uses shared utility

        res.json({
            success: true,
            message: "fetched successfully",
            payload: encryptResponse(securedData)
        });

    } catch (err) {
        next(err);
    }
};

// ================== Mark Review Helpful (Public) ==================
const markReviewHelpful = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        await review.markHelpful();

        return res.json({
            success: true,
            message: "Review marked as helpful",
            data: {
                helpfulCount: review.helpfulCount,
                helpfulPercentage: review.helpfulPercentage
            }
        });
    } catch (err) {
        next(err);
    }
};

// ================== Business Autocomplete (Database Search) ==================
const getBusinessAutocomplete = async (req, res, next) => {
    try {
        const { input, limit = 20, lat, lng } = req.query; // Increase default limit to 20

        if (!input || input.trim().length < 2) {
            return res.json({
                success: true,
                suggestions: []
            });
        }

        const normalizedInput = input.trim();
        const lowerInput = normalizedInput.toLowerCase();

        // 1. Handle "Near Me" Intent
        if (lowerInput.includes('near me') || lowerInput.includes('nearby')) {
            return res.json({
                success: true,
                suggestions: [{
                    id: 'near-me',
                    name: 'Search Near Me',
                    location: 'Current Location',
                    displayText: '📍 Search Near Me',
                    type: 'action',
                    action: 'near_me'
                }]
            });
        }

        let keyword = normalizedInput;
        let location = '';

        // 2. Handle "Best/Top" Intent (Rating Sort)
        let isQualitySearch = false;
        if (lowerInput.startsWith('best ') || lowerInput.startsWith('top ')) {
            isQualitySearch = true;
            keyword = normalizedInput.replace(/^(best|top)\s+/i, '').trim();
        }

        // 3. Parse "Keyword IN Location" Pattern
        // Regex for "something in place" or "something at place"
        const locationMatch = keyword.match(/^(.*?)\s+(?:in|at|near|from)\s+(.*)$/i);
        if (locationMatch) {
            keyword = locationMatch[1]; // e.g., "spa"
            location = locationMatch[2]; // e.g., "vashi"
        }

        const suggestions = [];
        const limitNum = parseInt(limit);

        // 3. Parallel Searches
        const searchPromises = [];

        // A. Business Search (Direct Match)
        const businessQuery = {
            isActive: true,
            'settings.appointmentSettings.allowOnlineBooking': true,
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { branch: { $regex: keyword, $options: 'i' } }
            ]
        };

        // If location was parsed, restrict business search
        if (location) {
            businessQuery.$or.push({ address: { $regex: location, $options: 'i' } });
            businessQuery.$or.push({ city: { $regex: location, $options: 'i' } });
            businessQuery.$or.push({ area: { $regex: location, $options: 'i' } });
        } else {
            businessQuery.$or.push({ address: { $regex: keyword, $options: 'i' } });
            businessQuery.$or.push({ city: { $regex: keyword, $options: 'i' } });
            businessQuery.$or.push({ area: { $regex: keyword, $options: 'i' } });
        }

        // Sort configuration
        let sortConfig = { 'ratings.average': -1, 'stats.popularity': -1 }; // Default: High rating -> Popularity

        // Behavior:
        // 1. If lat/lng provided: Sort by distance is implicitly desired but mongo needs $near or aggregation
        // 2. For basic find(), we can't easily mixed sort specific items by distance without geoNear
        // 3. However, user wants "High Rated 20 Near Location".

        searchPromises.push(
            Business.find(businessQuery)
                .select('name address city branch area businessLink ratings.average stats.popularity location')
                .sort(sortConfig) // Prioritize high rated
                .limit(limitNum)
                .lean()
                .then(results => results.map(b => {
                    const loc = [b.branch, b.area, b.city].filter(Boolean).join(', ');

                    // Basic distance scoring if lat/lng available (client-side of this function)
                    let distScore = 0;
                    if (lat && lng && b.location && b.location.coordinates) {
                        const [bLng, bLat] = b.location.coordinates;
                        // Simple Euclidean distance for sorting (accurate enough for sorting)
                        const dist = Math.sqrt(Math.pow(parseFloat(lat) - bLat, 2) + Math.pow(parseFloat(lng) - bLng, 2));
                        distScore = 100 / (dist + 1); // Closer = higher score
                    }

                    return {
                        id: b._id,
                        name: b.name,
                        location: loc,
                        displayText: `${b.name} - ${loc}`,
                        businessLink: b.businessLink,
                        rating: b.ratings?.average || 0,
                        type: 'business',
                        score: 10 + (b.ratings?.average || 0) + distScore // Combined score
                    };
                }))
        );

        // B. Service Search
        // Find services matching the keyword
        const serviceQuery = {
            isActive: true,
            name: { $regex: keyword, $options: 'i' }
        };

        searchPromises.push(
            Service.find(serviceQuery)
                .select('name category business')
                .populate('business', 'name city area branch')
                .limit(5)
                .lean()
                .then(results => results
                    .filter(s => s.business) // Ensure business exists
                    .map(s => {
                        const loc = [s.business.branch, s.business.area, s.business.city].filter(Boolean).join(', ');
                        return {
                            id: s._id,
                            name: s.name, // Search query becomes service name
                            location: loc,
                            displayText: `${s.name} at ${s.business.name} (${loc})`,
                            businessLink: s.business.businessLink, // Or separate service link
                            type: 'service',
                            score: 8
                        };
                    }))
        );

        // C. Category/Tag Search (Generic)
        // If keyword matches a category, suggest "Category in Location" or just "Category"
        // We can check available categories or just synthetically generate this if no exact business match
        // For now, let's skip complex aggregation for speed and just rely on service search which covers categories often

        // Execute Searches
        const [businessResults, serviceResults] = await Promise.all(searchPromises);

        // Merge and Sort
        const allSuggestions = [...businessResults, ...serviceResults];

        // Deduplicate by displayText
        const uniqueSuggestions = [];
        const seenTexts = new Set();

        allSuggestions.sort((a, b) => b.score - a.score); // Priority sorting

        for (const item of allSuggestions) {
            if (!seenTexts.has(item.displayText)) {
                seenTexts.add(item.displayText);
                uniqueSuggestions.push(item);
            }
            if (uniqueSuggestions.length >= limitNum) break;
        }

        // If parsed location exists but no direct results found, 
        // add a generic "Search for [Keyword] in [Location]" suggestion
        if (uniqueSuggestions.length === 0 && location) {
            uniqueSuggestions.push({
                id: 'generic-search',
                name: keyword,
                location: location,
                displayText: `🔍 Search for "${keyword}" in ${location}`,
                type: 'generic'
            });
        }

        // Add "Best Rated [Keyword]" suggestion if quality intent detected
        if (isQualitySearch) {
            uniqueSuggestions.unshift({
                id: 'best-rated',
                name: keyword,
                displayText: `⭐ Best Rated ${keyword} ${location ? 'in ' + location : ''}`,
                type: 'generic',
                searchQuery: `best ${keyword} ${location ? 'in ' + location : ''}`
            });
        }

        return res.json({
            success: true,
            suggestions: uniqueSuggestions,
            source: 'database_smart'
        });
    } catch (error) {
        console.error('[Business Autocomplete] Error:', error);
        return res.json({
            success: true,
            suggestions: [],
            source: 'error'
        });
    }
};

// ================== Google Places Autocomplete (Public) ==================
const getPlacesAutocomplete = async (req, res, next) => {
    try {
        const { input, types, location } = req.query;

        if (!input || input.trim().length < 2) {
            return res.json({
                success: true,
                suggestions: []
            });
        }

        // Try Google Places API first
        const options = {};
        if (types) options.types = types;
        if (location) {
            const coords = location.split(',');
            if (coords.length === 2) {
                options.location = `${coords[0]},${coords[1]}`;
                options.radius = 50000; // 50km radius for bias
            }
        }

        const result = await googlePlaces.autocomplete(input, options);

        if (result.success && result.suggestions.length > 0) {
            return res.json({
                success: true,
                suggestions: result.suggestions,
                source: 'google_places'
            });
        }

        // Fallback: Return empty suggestions if Places API fails
        // Frontend will handle manual input
        return res.json({
            success: true,
            suggestions: [],
            source: 'fallback',
            message: 'Google Places API unavailable. Please enter location manually.'
        });
    } catch (error) {
        console.error('[Places Autocomplete] Error:', error);
        // Return empty instead of error for better UX
        return res.json({
            success: true,
            suggestions: [],
            source: 'error'
        });
    }
};

// ================== Get Place Details (Public) ==================
const getPlaceDetails = async (req, res, next) => {
    try {
        const { place_id } = req.query;

        if (!place_id) {
            return res.status(400).json({
                success: false,
                error: 'place_id is required'
            });
        }

        const result = await googlePlaces.getPlaceDetails(place_id);

        if (result.success) {
            return res.json({
                success: true,
                place: result.place
            });
        }

        return res.status(404).json({
            success: false,
            error: result.error || 'Place not found'
        });
    } catch (error) {
        next(error);
    }
};

// ================== Enhanced Search with Google Places (Public) ==================
const searchWithPlaces = async (req, res, next) => {
    try {
        const {
            lat,
            lng,
            q,
            location,
            category,
            minRating,
            radius = 5000,
            page = 1,
            limit = 20
        } = req.query;

        let searchLat = lat ? parseFloat(lat) : null;
        let searchLng = lng ? parseFloat(lng) : null;

        // If location name is provided but no coordinates, geocode it
        if (location && (!searchLat || !searchLng)) {
            const geocodeResult = await googlePlaces.geocode(location);
            if (geocodeResult.success && geocodeResult.result) {
                searchLat = geocodeResult.result.lat;
                searchLng = geocodeResult.result.lng;
            }
        } else if (!location && !searchLat && q) {
            // Smart Parse: If no location provided but 'q' exists

            // 1. Check for "Keyword IN Location" pattern
            const locationMatch = q.match(/^(.*?)\s+(?:in|at|near|from)\s+(.*)$/i);
            if (locationMatch) {
                const extractedLocation = locationMatch[2];
                const geocodeResult = await googlePlaces.geocode(extractedLocation);
                if (geocodeResult.success && geocodeResult.result) {
                    searchLat = geocodeResult.result.lat;
                    searchLng = geocodeResult.result.lng;
                }
            }
        }

        // Handle "Best/Top" Intent in Query
        let searchQuery = q;
        let sortOption = req.query.sort;
        let minRatingFilter = minRating;

        if (q && (q.toLowerCase().startsWith('best ') || q.toLowerCase().startsWith('top '))) {
            searchQuery = q.replace(/^(best|top)\s+/i, '').trim();
            sortOption = 'rating'; // Sort by rating
            if (!minRatingFilter) minRatingFilter = 4; // Auto-filter for high rating
        }

        // Fetch Google Places results (if enabled)
        let placesResults = [];
        if (searchLat && searchLng && googlePlaces.isEnabled()) {
            const keyword = q || category || 'spa';
            const nearbyResult = await googlePlaces.nearbySearch(
                searchLat,
                searchLng,
                keyword,
                parseInt(radius)
            );

            if (nearbyResult.success) {
                placesResults = nearbyResult.places;
            }
        }

        // Fetch database results (existing search)
        const dbParams = {
            lat: searchLat,
            lng: searchLng,
            q: searchQuery, // Use parsed query (stripped of 'best'/'top')
            location,
            category,
            minRating: minRatingFilter, // Use filter from quality intent
            sort: sortOption, // Use sort from quality intent
            radius,
            page,
            limit
        };

        // Use existing searchBusinesses logic
        const pipeline = [];
        const baseMatch = {
            isActive: true,
            'settings.appointmentSettings.allowOnlineBooking': true
        };

        if (searchLat && searchLng) {
            pipeline.push({
                $geoNear: {
                    near: { type: "Point", coordinates: [searchLng, searchLat] },
                    distanceField: "distance",
                    maxDistance: parseInt(radius),
                    spherical: true,
                    query: baseMatch
                }
            });
        } else {
            pipeline.push({ $match: baseMatch });
        }

        pipeline.push({
            $lookup: {
                from: "services",
                localField: "_id",
                foreignField: "business",
                as: "serviceDetails"
            }
        });

        const matchStage = {};
        if (q) {
            const terms = q.trim().split(/\s+/);
            matchStage.$and = terms.map(term => {
                const regex = new RegExp(term, "i");
                return {
                    $or: [
                        { name: regex },
                        { category: regex },
                        { tags: regex },
                        { description: regex },
                        { address: regex },
                        { "serviceDetails.name": regex }
                    ]
                };
            });
        }

        if (category) matchStage.type = { $regex: category, $options: "i" };
        if (minRating) matchStage['ratings.average'] = { $gte: parseFloat(minRating) };

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push({
            $project: {
                name: 1,
                type: 1,
                branch: 1,
                address: 1,
                location: 1,
                images: 1,
                image: { $ifNull: ["$images.thumbnail", { $ifNull: ["$images.logo", "$images.banner"] }] },
                ratings: 1,
                category: 1,
                tags: 1,
                description: 1,
                phone: 1,
                socialMedia: 1,
                businessLink: 1,
                distance: { $ifNull: ["$distance", null] },
                snippet: { $concat: [{ $substrCP: [{ $ifNull: ["$description", ""] }, 0, 150] }, "..."] },
                serviceDetails: 1,
                offers: 1
            }
        });

        if (searchLat && searchLng) {
            pipeline.push({ $sort: { distance: 1, 'ratings.average': -1 } });
        } else {
            pipeline.push({ $sort: { 'ratings.average': -1, createdAt: -1 } });
        }

        const limitNum = Math.min(Math.max(parseInt(limit), 1), 5000);
        pipeline.push({
            $facet: {
                results: [
                    { $skip: (parseInt(page) - 1) * limitNum },
                    { $limit: limitNum }
                ],
                totalCount: [{ $count: "count" }]
            }
        });

        const dbResult = await Business.aggregate(pipeline);
        const businesses = dbResult[0]?.results || [];
        const totalResults = dbResult[0]?.totalCount[0]?.count || 0;

        // Format database results
        const formattedResults = businesses.map(b => ({
            id: b._id,
            name: b.name,
            type: b.type,
            branch: b.branch,
            address: b.address,
            category: b.category,
            tags: b.tags,
            ratings: b.ratings,
            image: b.image || b.images?.thumbnail || b.images?.logo,
            gallery: b.images?.gallery || [],
            distance: b.distance,
            distanceText: b.distance ? `${(b.distance / 1000).toFixed(1)} km` : '',
            snippet: b.snippet,
            location: b.location,
            phone: b.phone,
            socialMedia: b.socialMedia,
            services: (b.serviceDetails || []).slice(0, 5).map(s => ({ name: s.name, price: s.price })),
            offers: b.offers || [],
            businessLink: b.businessLink,
            source: 'database'
        }));

        // Merge results (Google Places + Database)
        // Remove duplicates by name proximity
        const mergedResults = [...formattedResults];
        const existingNames = new Set(formattedResults.map(b => b.name.toLowerCase()));

        placesResults.forEach(place => {
            // Simple duplicate check by name
            if (!existingNames.has(place.name.toLowerCase())) {
                mergedResults.push({
                    id: place.place_id,
                    name: place.name,
                    address: place.vicinity,
                    ratings: place.rating ? { average: place.rating, totalReviews: place.user_ratings_total || 0 } : null,
                    location: { coordinates: [place.lng, place.lat] },
                    distance: null, // Will be calculated on frontend if needed
                    snippet: `Found on Google Places - ${place.vicinity}`,
                    source: 'google_places',
                    isExternal: true, // Flag for frontend to handle differently
                    place_id: place.place_id
                });
                existingNames.add(place.name.toLowerCase());
            }
        });

        const responseData = {
            page: parseInt(page),
            limit: limitNum,
            totalResults: mergedResults.length,
            results: mergedResults,
            sources: {
                database: formattedResults.length,
                google_places: placesResults.length
            }
        };

        return res.json({
            success: true,
            message: "Fetched successfully",
            payload: encryptResponse(responseData)
        });
    } catch (error) {
        next(error);
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
    searchBusinesses,
    autocompleteSuggestions,
    getIndiaLocations,
    updateBusiness,
    addBusinessReview,
    getBusinessReviews,
    markReviewHelpful,
    getBusinessAutocomplete,
    getPlacesAutocomplete,
    getPlaceDetails,
    searchWithPlaces
};
