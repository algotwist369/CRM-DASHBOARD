const express = require("express");
const router = express.Router();
const {
    sendOtp,
    verifyOtp,
    createBookDemo,
    getAllBookDemos,
    getBookDemoById,
    deleteBookDemo,
    updateBookDemoStatus,
} = require("../controller/bookDemo.controller");

// OTP Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Book Demo Routes
router.post("/", createBookDemo);

router.get("/", getAllBookDemos);

router.get("/:id", getBookDemoById);

router.put("/:id", updateBookDemoStatus);

router.delete("/:id", deleteBookDemo);

module.exports = router;
