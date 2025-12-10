const Advertise = require("../models/Advertise");
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
        const { phoneNumber, name } = req.body;

        if (!phoneNumber || !name) {
            return res.status(400).json({
                success: false,
                message: "Phone number and name are required",
            });
        }

        await sendOtpToUser(phoneNumber, name);

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

        // Get OTP record to retrieve name
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

        // Save verified status with name (use businessName from OTP record)
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
// STEP 3: CREATE ADVERTISE LEAD (Allowed only if verified)
// ============================
const createAdvertise = async (req, res) => {
    try {
        const {
            name,
            company,
            email,
            phone,
            website,
            budget,
            timeline,
            message,
        } = req.body;

        // Check if phone number is verified
        const verified = await VerifiedUser.findOne({ phoneNumber: phone });

        if (!verified || !verified.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Phone number not verified. Please verify your phone number first.",
            });
        }

        const newLead = await Advertise.create({
            name,
            company,
            email,
            phone,
            website,
            budget,
            timeline,
            message,
        });

        // Send confirmation email to user (optional)
        if (email && process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false") {
            try {
                await sendNotificationEmail(
                    email,
                    "Advertising Request Received",
                    `Hello ${name}, we have received your advertising request for ${company}. Our team will contact you soon.`
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
                    "New Advertising Lead",
                    `A new advertising lead has been submitted by ${name} from ${company}. Budget: ${budget}, Timeline: ${timeline}`
                );
            } catch (emailError) {
                console.error("Failed to send admin notification:", emailError);
            }
        }

        res.status(201).json({
            success: true,
            message: "Advertise request submitted successfully",
            data: newLead,
        });
    } catch (error) {
        console.error("Create Advertise Error:", error);

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
                message: "Duplicate entry. This advertising request already exists.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to submit advertise request",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};

// ============================
// Get All Advertise Leads (Pagination + Search)
// ============================
const getAllAdvertise = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "" } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        // Validate pagination
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;

        const skip = (page - 1) * limit;

        // Build query - only add search if search term is provided
        const query = search.trim() ? {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { budget: { $regex: search, $options: "i" } },
                { timeline: { $regex: search, $options: "i" } },
            ],
        } : {};

        const totalItems = await Advertise.countDocuments(query);

        const records = await Advertise.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            data: records,
        });
    } catch (error) {
        console.error("Get All Advertise Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch advertise requests",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};

// ============================
// Get Single Advertise Request
// ============================
const getAdvertiseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
            });
        }

        const record = await Advertise.findById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Advertise request not found",
            });
        }

        res.status(200).json({
            success: true,
            data: record,
        });
    } catch (error) {
        console.error("Get Advertise By ID Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch advertise request",
            error: error.message,
        });
    }
};

// ============================
// Update Advertise Request
// ============================
const updateAdvertise = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
            });
        }

        const updated = await Advertise.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Advertise request not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Advertise request updated successfully",
            data: updated,
        });
    } catch (error) {
        console.error("Update Advertise Error:", error);

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
            message: "Failed to update advertise request",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};

// ============================
// Delete Advertise Request
// ============================
const deleteAdvertise = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
            });
        }

        const deleted = await Advertise.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Advertise request not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Advertise request deleted successfully",
            data: deleted,
        });
    } catch (error) {
        console.error("Delete Advertise Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete advertise request",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};


module.exports = {
    sendOtp,
    verifyOtp,
    createAdvertise,
    getAllAdvertise,
    getAdvertiseById,
    updateAdvertise,
    deleteAdvertise,
}