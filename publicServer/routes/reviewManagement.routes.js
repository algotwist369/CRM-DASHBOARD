const express = require("express");
const router = express.Router();

const {
  sendOtp,
  verifyOtp,
  createReviewRequest,
    getReviewRequests,
    getReviewRequestById,
    updateReviewRequest,
    deleteReviewRequest,
} = require("../controller/reviewManagement.controller");

// OTP Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Review Management Routes
router.post("/", createReviewRequest);

router.get("/", getReviewRequests);

router.get("/:id", getReviewRequestById);

router.put("/:id", updateReviewRequest);

router.delete("/:id", deleteReviewRequest);

module.exports = router;
