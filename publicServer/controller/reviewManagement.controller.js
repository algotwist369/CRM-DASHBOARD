const ReviewManagement = require("../models/ReviewManagement");
const VerifiedUser = require("../models/VerifiedUser.model");
const Otp = require("../models/Otp.model");
const mongoose = require("mongoose");
const { sendNotificationEmail } = require("../utils/sendMail");
const { sendOtpToUser, verifyOtpCode } = require("../utils/sendOTP");

// ============================
// STEP 1: SEND OTP
// ============================
const sendOtp = async (req, res) => {
    try {
        const { phoneNumber, fullName } = req.body;

        if (!phoneNumber || !fullName) {
            return res.status(400).json({
                success: false,
                message: "Phone number and full name are required",
            });
        }

        await sendOtpToUser(phoneNumber, fullName);

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

// ============================
// STEP 2: VERIFY OTP
// ============================
const verifyOtp = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and OTP are required",
            });
        }

        // Get OTP record to retrieve fullName
        const otpRecord = await Otp.findOne({ phoneNumber, otp });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        // Check if OTP has expired
        if (otpRecord.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        // Save verified status with fullName
        await VerifiedUser.updateOne(
            { phoneNumber },
            { 
                phoneNumber, 
                businessName: otpRecord.businessName || otpRecord.fullName,
                isVerified: true 
            },
            { upsert: true }
        );

        // Delete used OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        return res.status(200).json({
            success: true,
            message: "OTP Verified Successfully",
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
            error: error.message,
        });
    }
};

// ============================
// STEP 3: CREATE REVIEW REQUEST (Allowed only if verified)
// ============================
const createReviewRequest = async (req, res) => {
    try {
        const {
            businessName,
            fullName,
            email,
            phoneNumber,
            reviewPlatform,
            targetReviewCount,
            businessLink,
            message,
            terms
        } = req.body;

        // Check if phone number is verified
        const verified = await VerifiedUser.findOne({ phoneNumber });

        if (!verified || !verified.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Phone number not verified. Please verify your phone number first.",
            });
        }

        // Extra safety validation
        if (!terms) {
            return res.status(400).json({ 
                success: false, 
                message: "You must agree to the terms and conditions." 
            });
        }

        // Create record
        const newRequest = await ReviewManagement.create({
            businessName,
            fullName,
            email,
            phoneNumber,
            reviewPlatform,
            targetReviewCount,
            businessLink,
            message,
            terms,
        });

        // Send confirmation email to user (optional)
        if (email && process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false") {
            try {
                await sendNotificationEmail(
                    email,
                    "Review Management Request Received",
                    `Hello ${fullName}, we have received your review management request for ${businessName}. Our team will contact you soon.`
                );
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
            }
        }

        // Send notification to admin (optional)
        if (process.env.ADMIN_EMAIL && process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false") {
            try {
                await sendNotificationEmail(
                    process.env.ADMIN_EMAIL,
                    "New Review Management Request",
                    `A new review management request has been submitted by ${fullName} for ${businessName}. Platform: ${reviewPlatform}, Target Reviews: ${targetReviewCount}`
                );
            } catch (emailError) {
                console.error("Failed to send admin notification:", emailError);
            }
        }

        res.status(201).json({
            success: true,
            message: "Review management request submitted successfully.",
            data: newRequest,
        });
    } catch (error) {
        console.error("Create Review Request Error:", error);

        // Handle validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors,
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate entry. This review request already exists.",
            });
        }

        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined 
        });
    }
};


// Get All Requests (Pagination + Search)
const getReviewRequests = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "", reviewPlatform = "" } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        // Validate pagination
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;

        // Build query
        const query = {};

        if (search.trim()) {
            query.$or = [
                { businessName: { $regex: search, $options: "i" } },
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phoneNumber: { $regex: search, $options: "i" } },
                { reviewPlatform: { $regex: search, $options: "i" } },
            ];
        }

        if (reviewPlatform.trim()) {
            query.reviewPlatform = { $regex: reviewPlatform, $options: "i" };
        }

        const skip = (page - 1) * limit;

        const total = await ReviewManagement.countDocuments(query);
        const data = await ReviewManagement.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data,
        });
    } catch (error) {
        console.error("Get Review Requests Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined 
        });
    }
};


// Get Single Request by ID
const getReviewRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const data = await ReviewManagement.findById(id);

        if (!data) {
            return res.status(404).json({ 
                success: false, 
                message: "Review request not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            data 
        });
    } catch (error) {
        console.error("Get Review Request By ID Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined 
        });
    }
};


// Update Review Request
const updateReviewRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const updatedData = await ReviewManagement.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedData) {
            return res.status(404).json({ 
                success: false, 
                message: "Review request not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Review request updated successfully",
            data: updatedData,
        });
    } catch (error) {
        console.error("Update Review Request Error:", error);

        // Handle validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors,
            });
        }

        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined 
        });
    }
};


// Delete Request
const deleteReviewRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const deleted = await ReviewManagement.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ 
                success: false, 
                message: "Review request not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Review request deleted successfully",
            data: deleted
        });
    } catch (error) {
        console.error("Delete Review Request Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined 
        });
    }
};


module.exports = {
    sendOtp,
    verifyOtp,
    createReviewRequest,
    getReviewRequests,
    getReviewRequestById,
    updateReviewRequest,
    deleteReviewRequest,
}