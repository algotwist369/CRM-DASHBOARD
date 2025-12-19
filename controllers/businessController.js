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


// ===========================================
// ============ PUBLIC CONTROLLERS ===========
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
            .select('name type branch address city state country phone email website description settings businessLink images socialMedia location googleMapsUrl ratings features amenities category tags createdAt')
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
            message: "fetched successfully",
            payload: encryptResponse(response)
        };

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
                distanceMeters: distance
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

// ================== Search Businesses (Public - Advanced) ==================
// TODO: Required Indexes:
// 1. db.businesses.createIndex({ location: "2dsphere" })
// 2. db.businesses.createIndex({ name: "text", category: "text", subCategory: "text", tags: "text", description: "text" })

// TODO: Geocoding Stub
// function geocodeAddress(address) {
//     // Integration with Google Maps Geocoding API or similar would go here
//     // return { lat, lng };
//     console.log("Geocoding not implemented yet");
//     return null;
// }

/**
 * Advanced Location-Based Search API
 * 
 * Supports:
 * - "best hotel near me" (via q + lat/lng)
 * - "spa in vashi" (via q - currently requires lat/lng of "vashi" to be passed from frontend Geocoding)
 * - Category filtering
 * - Sorting
 * 
 * Test Outlines:
 * 1. Missing Coords -> 400 Bad Request
 *    curl "http://localhost:5000/api/business/public/search?q=hotel"
 * 2. Valid Search -> Success with Results
 *    curl "http://localhost:5000/api/business/public/search?lat=19.0760&lng=72.8777&q=spa&radius=5000"
 */
const searchBusinesses = async (req, res, next) => {
    try {
        const {
            lat,
            lng,
            q,
            category,
            minRating,
            radius = 5000,
            sort,
            page = 1,
            limit = 20
        } = req.query;

        // 1. Validation & Setup
        // lat/lng are optional now to support "All Locations" default view.
        let hasLocation = false;
        let latitude, longitude;

        if (lat && lng) {
            latitude = parseFloat(lat);
            longitude = parseFloat(lng);
            if (!isNaN(latitude) && !isNaN(longitude)) {
                hasLocation = true;
            }
        }

        const maxDistance = parseInt(radius) || 5000;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(Math.max(parseInt(limit), 1), 50);

        // 2. Build Pipeline
        const pipeline = [];

        // Base match criteria (always required)
        const baseMatch = {
            isActive: true,
            'settings.appointmentSettings.allowOnlineBooking': true
        };

        if (hasLocation) {
            // Stage 1: GeoNear
            pipeline.push({
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    distanceField: "distance",
                    maxDistance: maxDistance,
                    spherical: true,
                    query: baseMatch // $text cannot be here
                }
            });

            // Lookup Services for Search
            pipeline.push({
                $lookup: {
                    from: "services",
                    localField: "_id",
                    foreignField: "business",
                    as: "serviceDetails"
                }
            });

            // Stage 2: Match (Smart Regex for q: supports "spa london" etc.)
            const matchStage = {};
            if (q) {
                // Split query into terms to allow "Spa London" (Category + City)
                const terms = q.trim().split(/\s+/);
                const termConditions = terms.map(term => {
                    const regex = new RegExp(term, 'i');
                    return {
                        $or: [
                            { name: regex },
                            { category: regex },
                            { "tags": regex },
                            { description: regex },
                            { address: regex },
                            { city: regex },
                            { state: regex },
                            { zipCode: regex },
                            { "serviceDetails.name": regex }
                        ]
                    };
                });

                if (termConditions.length > 0) {
                    matchStage.$and = termConditions;
                }
            }

            // Add Category filter
            if (category) {
                matchStage.type = { $regex: category, $options: 'i' };
            }

            // Add Min Rating
            if (minRating) {
                matchStage['ratings.average'] = { $gte: parseFloat(minRating) };
            }

            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }

        } else {
            // Global Search (No Location)
            // Match base criteria -> Lookup -> Match Query
            pipeline.push({ $match: baseMatch });

            pipeline.push({
                $lookup: {
                    from: "services",
                    localField: "_id",
                    foreignField: "business",
                    as: "serviceDetails"
                }
            });

            if (q) {
                // Smart Regex Search Implementation
                const terms = q.trim().split(/\s+/);
                const termConditions = terms.map(term => {
                    const regex = new RegExp(term, 'i');
                    return {
                        $or: [
                            { name: regex },
                            { category: regex },
                            { "tags": regex },
                            { description: regex },
                            { address: regex },
                            { city: regex },
                            { state: regex },
                            { zipCode: regex },
                            { "serviceDetails.name": regex }
                        ]
                    };
                });

                if (termConditions.length > 0) {
                    pipeline.push({ $match: { $and: termConditions } });
                }
            }

            const secondaryMatch = {};
            if (category) {
                secondaryMatch.type = { $regex: category, $options: 'i' };
            }
            if (minRating) {
                secondaryMatch['ratings.average'] = { $gte: parseFloat(minRating) };
            }

            if (Object.keys(secondaryMatch).length > 0) {
                pipeline.push({ $match: secondaryMatch });
            }
        }

        // Stage 3: Project (Format & Snippet)
        pipeline.push({
            $project: {
                name: 1,
                type: 1,
                branch: 1,
                address: 1,
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
                distance: { $ifNull: ["$distance", null] },
                snippet: {
                    $concat: [
                        { $substrCP: [{ $ifNull: ["$description", ""] }, 0, 150] },
                        "..."
                    ]
                }
            }
        });

        // Stage 4: Sort
        if (sort === 'rating') {
            pipeline.push({ $sort: { "ratings.average": -1 } });
        } else if (!hasLocation && !q) {
            // Default sort for non-geo, non-text search: Newest first
            pipeline.push({ $sort: { createdAt: -1 } });
        }

        // Stage 5: Pagination Facet
        pipeline.push({
            $facet: {
                results: [
                    { $skip: (pageNum - 1) * limitNum },
                    { $limit: limitNum }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        });

        // 3. Execute
        const result = await Business.aggregate(pipeline);

        const businesses = result[0].results;
        const totalResults = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
        const businessIds = businesses.map(b => b._id);
        const servicesMap = {};

        if (businessIds.length > 0) {
            const services = await Service.find({
                business: { $in: businessIds },
                isActive: true
            })
                .select('name business')
                .lean();

            services.forEach(service => {
                if (!servicesMap[service.business]) {
                    servicesMap[service.business] = [];
                }
                // Limit to 5 services per business for listing
                if (servicesMap[service.business].length < 5) {
                    servicesMap[service.business].push({
                        name: service.name
                    });
                }
            });
        }

        // 4. Format Output
        const formattedResults = businesses.map(b => {
            // Calculate human readable distance
            let distanceText = "";
            if (b.distance !== null && b.distance !== undefined) {
                if (b.distance < 1000) {
                    distanceText = `${Math.round(b.distance)} m`;
                } else {
                    distanceText = `${(b.distance / 1000).toFixed(1)} km`;
                }
            }

            return {
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
                distanceText: distanceText,
                snippet: b.snippet,
                location: b.location,
                phone: b.phone,
                socialMedia: b.socialMedia,
                services: servicesMap[b._id] || [],
                businessLink: b.businessLink
            };
        });

        // Encryption logic
        // Uses shared utility

        const responseData = {
            page: pageNum,
            limit: limitNum,
            totalResults: totalResults,
            results: formattedResults
        };

        return res.json({
            success: true,
            message: "Fetched successfully",
            payload: encryptResponse(responseData)
        });

    } catch (err) {
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
// ============ ADMIN & MANAGER ==============
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
        const updates = req.body;
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

        // Save to trigger pre-save hooks (for Google Maps URL lat/lng extraction and businessLink generation)
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

module.exports = {
    getPublicBusinesses,
    getBusinessInfoByLink,
    getBusinessById,
    getBusinessStaff,
    getBusinessDailyRecords,
    getBusinessAnalytics,
    getBusinessesNearby,
    searchBusinesses, // Added new API
    getIndiaLocations,
    updateBusiness,
    addBusinessReview,
    getBusinessReviews
};
