const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Reports (Admin & Manager)
router.use(authMiddleware);

router.get("/", reportController.getReports);
router.get("/analytics", reportController.getAnalytics);
router.get("/export", reportController.exportReports);

module.exports = router;
