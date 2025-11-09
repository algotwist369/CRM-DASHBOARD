const express = require("express");
const router = express.Router();
const dailyBusinessController = require("../controllers/dailyBusinessController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(authMiddleware);

// ================== Daily Business Routes ==================

// Add daily business record (Manager + Staff)
router.post("/", 
    roleMiddleware(["manager", "staff"]), 
    dailyBusinessController.addDailyBusiness
);

// Get daily business records (Manager + Admin + Staff)
router.get("/", 
    roleMiddleware(["manager", "admin", "staff"]), 
    dailyBusinessController.getDailyBusinessRecords
);

// Get daily summary (Manager + Admin + Staff)
router.get("/summary", 
    roleMiddleware(["manager", "admin", "staff"]), 
    dailyBusinessController.getDailySummary
);

// Get business analytics (Manager + Admin + Staff)
router.get("/analytics", 
    roleMiddleware(["manager", "admin", "staff"]), 
    dailyBusinessController.getBusinessAnalytics
);

// Update daily business record (Manager only)
router.put("/:id", 
    roleMiddleware(["manager"]), 
    dailyBusinessController.updateDailyBusiness
);

// Delete daily business record (Manager only)
router.delete("/:id", 
    roleMiddleware(["manager"]), 
    dailyBusinessController.deleteDailyBusiness
);

module.exports = router;
