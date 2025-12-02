const FreeListing = require("../models/FreeListing.model");
const VerifiedUser = require("../models/VerifiedUser.model");
const { sendOtpToUser, verifyOtpCode } = require("../utils/sendOTP");

// =============================
// STEP 1: SEND OTP
// =============================
exports.sendOtp = async (req, res) => {
    try {
        const { phoneNumber, businessName } = req.body;

        if (!phoneNumber || !businessName) {
            return res.status(400).json({
                success: false,
                message: "Phone number and business name are required",
            });
        }

        const otp = await sendOtpToUser(phoneNumber, businessName);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error("Send OTP Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send OTP",
        });
    }
};

// =============================
// STEP 2: VERIFY OTP
// =============================
exports.verifyOtp = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone and OTP required",
            });
        }

        const isValid = await verifyOtpCode(phoneNumber, otp);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        // Save verified status
        await VerifiedUser.updateOne(
            { phoneNumber },
            { phoneNumber, isVerified: true },
            { upsert: true }
        );

        return res.status(200).json({
            success: true,
            message: "OTP Verified Successfully",
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
};

// =============================
// STEP 3: CREATE FREE LISTING (Allowed only if verified)
// =============================
exports.createFreeListing = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        const verified = await VerifiedUser.findOne({ phoneNumber });

        if (!verified || !verified.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Phone number not verified",
            });
        }

        const entry = await FreeListing.create(req.body);

        res.status(201).json({
            success: true,
            message: "Free listing created successfully",
            data: entry,
        });
    } catch (error) {
        console.error("Create Free Listing Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create listing",
        });
    }
};


// =============================
// GET ALL FREE LISTINGS
// =============================
exports.getAllFreeListings = async (req, res) => {
    try {
        // Get page & limit from query, default page=1, limit=10
        let { page = 1, limit = 10 } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        // Calculate skip
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalListings = await FreeListing.countDocuments();

        // Fetch listings with pagination
        const listings = await FreeListing.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            total: totalListings,
            currentPage: page,
            totalPages: Math.ceil(totalListings / limit),
            limit,
            data: listings,
        });

    } catch (error) {
        console.error("Get All Free Listings Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve listings",
        });
    }
};

// =============================
// DELETE FREE LISTING
// =============================
exports.deleteFreeListing = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid listing ID",
            });
        }

        const deletedListing = await FreeListing.findByIdAndDelete(id);

        if (!deletedListing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Free listing deleted successfully",
            data: deletedListing,
        });
    } catch (error) {
        console.error("Delete Free Listing Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete listing",
        });
    }
};
