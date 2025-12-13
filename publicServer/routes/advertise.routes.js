const express = require("express");
const router = express.Router();

const {
    sendOtp,
    verifyOtp,
    createAdvertise,
    getAllAdvertise,
    getAdvertiseById,
    updateAdvertise,
    deleteAdvertise,
} = require("../controller/advertise.controller");

// OTP Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Advertise Routes
router.post("/", createAdvertise);

router.get("/", getAllAdvertise);

router.get("/:id", getAdvertiseById);

router.put("/:id", updateAdvertise);

router.delete("/:id", deleteAdvertise);

module.exports = router;
