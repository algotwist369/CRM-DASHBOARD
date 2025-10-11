const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes require authentication and manager role
router.use(authMiddleware, roleMiddleware(["manager"]));

// ================== Notification Management ==================

// Create notification
router.post("/", notificationController.createNotification);

// Send notification
router.post("/:notificationId/send", notificationController.sendNotification);

// Get notifications
router.get("/", notificationController.getNotifications);

// Get notification analytics
router.get("/:notificationId/analytics", notificationController.getNotificationAnalytics);

// ================== Campaign Management ==================

// Create campaign
router.post("/campaigns", notificationController.createCampaign);

// Get campaigns
router.get("/campaigns", notificationController.getCampaigns);

// ================== Customer Analytics ==================

// Get customer analytics
router.get("/analytics/customers", notificationController.getCustomerAnalytics);

module.exports = router;