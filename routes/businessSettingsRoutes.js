// businessSettingsRoutes.js - Business settings management routes
const express = require("express");
const router = express.Router();
const businessSettingsController = require("../controllers/businessSettingsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes require authentication (Admin or Manager)
router.use(authMiddleware, roleMiddleware(["admin", "manager"]));

// ================== Business Settings Management ==================

// Get business settings
router.get("/", businessSettingsController.getBusinessSettings);

// Update business hours
router.put("/business-hours", businessSettingsController.updateBusinessHours);

// Update appointment settings
router.put("/appointments", businessSettingsController.updateAppointmentSettings);

// Update notification preferences
router.put("/notifications", businessSettingsController.updateNotificationPreferences);

// Update payment settings
router.put("/payments", businessSettingsController.updatePaymentSettings);

// Update tax settings
router.put("/tax", businessSettingsController.updateTaxSettings);

// Update general settings
router.put("/general", businessSettingsController.updateGeneralSettings);

// Update loyalty settings
router.put("/loyalty", businessSettingsController.updateLoyaltySettings);

// ================== Holiday Management ==================

// Add holiday
router.post("/holidays", businessSettingsController.addHoliday);

// Remove holiday
router.delete("/holidays", businessSettingsController.removeHoliday);

module.exports = router;

