const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ================== Public Routes (No Authentication Required) ==================

// Get all public businesses (for home page listing)
router.get("/public/list", businessController.getPublicBusinesses);

// Get businesses near a location (geospatial query)
// Query params: lat, lng, maxDistance (in meters, default 5000), type, page, limit
router.get("/public/nearby", businessController.getBusinessesNearby);

// Get business info by business link (public for appointment booking)
router.get("/info/:businessLink", businessController.getBusinessInfoByLink);

// ================== Protected Routes (Authentication Required) ==================

// Update business (Admin + Manager)
// Admin can update any of their businesses by ID
// Manager can update their own business (use 'mine' or their business ID)
router.put("/:id", 
    authMiddleware,
    roleMiddleware(["admin", "manager"]), 
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
