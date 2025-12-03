const express = require("express");
const router = express.Router();
const {
    sendOtp,
    verifyOtp,
    createFreeListing,
    getAllFreeListings,
    deleteFreeListing
} = require("../controllers/freeListing.controller");

router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);

router.post("/create", createFreeListing);

router.get("/", getAllFreeListings);

router.delete("/:id", deleteFreeListing);

module.exports = router;
