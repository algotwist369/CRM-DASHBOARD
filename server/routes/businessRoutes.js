const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { uploadS3BusinessImages, handleUploadError } = require("../middleware/uploadMiddleware");

// ================== Public Routes (No Authentication Required) ==================

// Get all public businesses (for home page listing)
router.get("/public/list", businessController.getPublicBusinesses);

// Get master list of Indian locations (states and cities)
router.get("/public/locations/india", businessController.getIndiaLocations);

// Get businesses near a location (geospatial query)
// Query params: lat, lng, maxDistance (in meters, default 5000), type, page, limit
router.get("/public/nearby", businessController.getBusinessesNearby);

// Advanced Search (Location + Text)
// Query params: lat, lng, q, category, radius, sort, page, limit
router.get("/public/spa", businessController.searchBusinesses);

// Business Autocomplete - Search businesses in database
// Query params: input (required), limit (optional, default 10)
router.get("/public/search/business-autocomplete", businessController.getBusinessAutocomplete);

// Google Places API - Autocomplete for location search
// Query params: input (required), types (optional), location (optional)
router.get("/public/search/autocomplete", businessController.getPlacesAutocomplete);

// Google Places API - Get place details by place_id
// Query params: place_id (required)
router.get("/public/search/place-details", businessController.getPlaceDetails);

// Google Places API - Enhanced search with Google Places + Database merge
// Query params: lat, lng, q, location, category, minRating, radius, page, limit
router.get("/public/search/places", businessController.searchWithPlaces);

// Get list of reviews for a business (public)
router.get("/public/:id/reviews", businessController.getBusinessReviews);

// Add a review for a business (public)
router.post("/public/:id/reviews", businessController.addBusinessReview);

// Mark review as helpful (public)
router.post("/public/reviews/:id/helpful", businessController.markReviewHelpful);

// Get business info by business link (public for appointment booking)
router.get("/info/:businessLink", businessController.getBusinessInfoByLink);

// ================== Protected Routes (Authentication Required) ==================

// Update business (Admin + Manager)
// Admin can update any of their businesses by ID
// Manager can update their own business (use 'mine' or their business ID)
router.put("/:id",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    uploadS3BusinessImages,
    handleUploadError,
    businessController.updateBusiness
);

// Get business details (Admin + Manager)
router.get("/:id",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    businessController.getBusinessById
);

// Get business staff (Admin + Manager)
router.get("/:id/staff",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    businessController.getBusinessStaff
);

// Get business daily records (Admin + Manager)
router.get("/:id/daily-business",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    businessController.getBusinessDailyRecords
);

// Get business analytics (Admin + Manager)
router.get("/:id/analytics",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    businessController.getBusinessAnalytics
);

module.exports = router;
