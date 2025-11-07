const express = require("express");
const router = express.Router();
const managerController = require("../controllers/managerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Manager routes
router.use(authMiddleware, roleMiddleware(["manager"]));

// ================== Manager Dashboard ==================
router.get("/dashboard", managerController.getManagerDashboard);

// ================== Staff Management ==================
router.post("/staff", managerController.addStaff);
router.get("/staff", managerController.getStaff);
router.put("/staff/:id", managerController.updateStaff);
router.delete("/staff/:id", managerController.deleteStaff);

// ================== Transaction Management ==================
router.post("/transaction", managerController.addTransaction);
router.get("/transactions", managerController.getTransactions);

// ================== Business Management (Manager can update their own business) ==================
router.get("/business", managerController.getBusinessInfo);
router.put("/business", managerController.updateBusiness);

module.exports = router;
