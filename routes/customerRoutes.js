const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes require authentication and manager role
router.use(authMiddleware, roleMiddleware(["manager"]));

// ================== Customer Management ==================

// Get customers with filtering and pagination
router.get("/", customerController.getCustomers);

// Get customer details with timeline
router.get("/:customerId", customerController.getCustomerDetails);

// Update customer information
router.put("/:customerId", customerController.updateCustomer);

// Add note to customer
router.post("/:customerId/notes", customerController.addCustomerNote);

// Get customer timeline
router.get("/:customerId/timeline", customerController.getCustomerTimeline);

// ================== Customer Analytics ==================

// Get customer segments
router.get("/analytics/segments", customerController.getCustomerSegments);

// Get customer analytics
router.get("/analytics/overview", customerController.getCustomerAnalytics);

// Get customer insights and recommendations
router.get("/analytics/insights", customerController.getCustomerInsights);

// Get target customers for campaigns
router.post("/analytics/target", customerController.getTargetCustomers);

module.exports = router;
