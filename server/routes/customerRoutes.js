const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes require authentication (Admin or Manager)
router.use(authMiddleware, roleMiddleware(["admin", "manager"]));

// ================== Customer Management ==================

// Create new customer
router.post("/", customerController.createCustomer);

// Get customers with filtering and pagination
router.get("/", customerController.getCustomers);

// Customer analytics & insights
router.get("/analytics", customerController.getCustomerAnalytics);
router.get("/analytics/segments", customerController.getCustomerSegments);
router.get("/analytics/insights", customerController.getCustomerInsights);
router.post("/analytics/target", customerController.getTargetCustomers);

// Get customer statistics
router.get("/stats", customerController.getCustomerStats);

// Lookup customer by phone
router.get("/lookup", customerController.lookupCustomer);

// Get customer by ID
router.get("/:id", customerController.getCustomerById);

// Update customer information
router.put("/:id", customerController.updateCustomer);

// Delete customer (soft delete)
router.delete("/:id", customerController.deleteCustomer);

// ================== Loyalty Points ==================

// Add loyalty points to customer
router.post("/:id/loyalty/add", customerController.addLoyaltyPoints);

// Redeem loyalty points
router.post("/:id/loyalty/redeem", customerController.redeemLoyaltyPoints);

module.exports = router;
