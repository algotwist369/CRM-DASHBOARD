// campaignRoutes.js - Marketing campaign routes
const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const campaignEnhancedController = require("../controllers/campaignEnhancedController");
const campaignAnalyticsController = require("../controllers/campaignAnalyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes require authentication (Admin or Manager)
router.use(authMiddleware, roleMiddleware(["admin", "manager"]));

// ================== Campaign Management ==================

// Create new campaign
router.post("/", campaignController.createCampaign);

// Get campaigns with filtering and pagination
router.get("/", campaignController.getCampaigns);

// Get campaign statistics
router.get("/stats", campaignController.getCampaignStats);

// Get target audience count (for preview before creating campaign)
router.post("/audience-count", campaignController.getTargetAudienceCount);

// Get campaign by ID
router.get("/:id", campaignController.getCampaignById);

// Update campaign
router.put("/:id", campaignController.updateCampaign);

// ================== Campaign Actions ==================

// Launch campaign
router.post("/:id/launch", campaignController.launchCampaign);

// Cancel campaign
router.post("/:id/cancel", campaignController.cancelCampaign);

// Clone campaign
router.post("/:id/clone", campaignEnhancedController.cloneCampaign);

// ================== Campaign Templates ==================

// Create template
router.post("/templates", campaignEnhancedController.createTemplate);

// Get templates
router.get("/templates", campaignEnhancedController.getTemplates);

// Get popular templates
router.get("/templates/popular", campaignEnhancedController.getPopularTemplates);

// ================== Automated Campaigns ==================

// Create automated campaign
router.post("/automated", campaignEnhancedController.createAutomatedCampaign);

// Get automated campaigns
router.get("/automated", campaignEnhancedController.getAutomatedCampaigns);

// Trigger automated campaign manually
router.post("/automated/:id/trigger", campaignEnhancedController.triggerAutomatedCampaign);

// ================== Drip Campaigns ==================

// Create drip campaign
router.post("/drip", campaignEnhancedController.createDripCampaign);

// Get drip campaigns
router.get("/drip", campaignEnhancedController.getDripCampaigns);

// Enroll customer in drip campaign
router.post("/drip/:id/enroll", campaignEnhancedController.enrollInDrip);

// Get drip campaign enrollments
router.get("/drip/:id/enrollments", campaignEnhancedController.getDripEnrollments);

// ================== A/B Testing ==================

// Start A/B test
router.post("/:id/ab-test/start", campaignEnhancedController.startABTest);

// Get A/B test results
router.get("/:id/ab-test/results", campaignEnhancedController.getABTestResults);

// ================== Link Tracking ==================

// Generate tracking link with UTM parameters
router.post("/tracking/generate-link", campaignEnhancedController.generateTrackingLink);

// ================== Campaign Analytics ==================

// Get best time to send analysis
router.get("/analytics/best-time", campaignAnalyticsController.analyzeBestTimeToSend);

// Get customer engagement pattern
router.get("/analytics/customer-pattern/:customerId", campaignAnalyticsController.getCustomerEngagementPattern);

// Compare campaigns
router.post("/analytics/compare", campaignAnalyticsController.compareCampaigns);

// Get campaign insights
router.get("/analytics/insights", campaignAnalyticsController.getCampaignInsights);

module.exports = router;

