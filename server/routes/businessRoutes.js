const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ================== Public Routes (No Authentication Required) ==================

// Get business info by business link (public for appointment booking)
router.get("/info/:businessLink", businessController.getBusinessInfoByLink);

// ================== Protected Routes (Authentication Required) ==================

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
