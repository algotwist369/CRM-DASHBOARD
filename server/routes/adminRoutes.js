const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin only routes
router.use(authMiddleware, roleMiddleware(["admin"]));

// ================== Admin Dashboard ==================
router.get("/dashboard", adminController.getAdminDashboard);

// ================== Business Management ==================
router.post("/business", adminController.createBusiness);
router.get("/businesses", adminController.getBusinesses);
router.get("/:id", adminController.getBusinessById);
router.put("/business/:id", adminController.updateBusiness);
router.delete("/business/:id", adminController.deleteBusiness);
router.get("/business/:businessId/link", adminController.getBusinessLink);

// ================== Manager Management ==================
router.post("/manager", adminController.createManager);

module.exports = router;
