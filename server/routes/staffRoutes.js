const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Staff routes
router.use(authMiddleware, roleMiddleware(["staff"]));

// ================== Staff Dashboard ==================
router.get("/dashboard", staffController.getStaffDashboard);

// ================== Staff Profile ==================
router.get("/profile", staffController.getMyProfile);
router.put("/profile", staffController.updateMyProfile);

// ================== Business Info ==================
router.get("/business", staffController.getMyBusiness);

// ================== Transactions ==================
router.get("/transactions", staffController.getMyTransactions);
router.post("/transactions", staffController.addTransaction);
router.get("/transactions/:id", staffController.getMyTransactionById);
router.put("/transactions/:id", staffController.updateTransaction);
router.delete("/transactions/:id", staffController.deleteTransaction);

module.exports = router;
