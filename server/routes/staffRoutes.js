const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Staff routes
router.use(authMiddleware, roleMiddleware(["staff"]));

// ================== Staff Profile ==================
router.get("/profile", staffController.getMyProfile);
router.put("/profile", staffController.updateMyProfile);

// ================== Business Info ==================
router.get("/business", staffController.getMyBusiness);

module.exports = router;
