const express = require("express");
const router = express.Router();
const freeListingController = require("../controllers/freeListingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/send-otp", freeListingController.sendFreeListingOtp);
router.post("/verify-otp", freeListingController.verifyFreeListingOtp);
router.post("/", freeListingController.createFreeListing);

router.get("/", authMiddleware, freeListingController.getAllFreeListings);
router.get("/:id", authMiddleware, freeListingController.getFreeListingById);
router.put("/:id", authMiddleware, freeListingController.updateFreeListing);
router.delete("/:id", authMiddleware, freeListingController.deleteFreeListing);

module.exports = router;
