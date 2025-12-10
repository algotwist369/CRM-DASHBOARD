const mongoose = require("mongoose");
const BookDemo = require("../models/BookDemo");
const VerifiedUser = require("../models/VerifiedUser.model");
const Otp = require("../models/Otp.model");
const { bookDemoSchema } = require("../validators/bookDemo.validator");
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
// STEP 3: CREATE BOOK DEMO (Allowed only if verified)
// ============================
const createBookDemo = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Check if phone number is verified
        const verified = await VerifiedUser.findOne({ phoneNumber });

        if (!verified || !verified.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Phone number not verified. Please verify your phone number first.",
            });
        }

        const validatedData = bookDemoSchema.parse(req.body);

        const newEntry = await BookDemo.create(validatedData);

        // Send confirmation email to user (optional, won't fail if email fails)
        if (validatedData.email && process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false") {
            try {
                await sendNotificationEmail(
                    validatedData.email,
                    "Demo Request Received",
                    `Hello ${validatedData.fullName}, we have received your demo request for ${validatedData.businessName}. Our team will contact you soon.`
                );
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
                // Don't fail the request if email fails
            }
        }

        // Send notification to admin (optional)
        if (process.env.ADMIN_EMAIL && process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false") {
            try {
                await sendNotificationEmail(
                    process.env.ADMIN_EMAIL,
                    "New Demo Request",
                    `A new demo request has been submitted by ${validatedData.fullName} from ${validatedData.businessName}.`
                );
            } catch (emailError) {
                console.error("Failed to send admin notification:", emailError);
            }
        }

        return res.status(201).json({
            success: true,
            message: "Book demo request submitted successfully",
            data: newEntry,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors,
            });
        }

        // Handle Mongoose validation errors
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
                message: "Duplicate entry. This demo request already exists.",
            });
        }

        console.error("Create BookDemo Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit book demo request",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};

// ============================
// Get All Book Demos (Pagination + Search)
// ============================
const getAllBookDemos = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "", isCompleted = "" } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        // Validate pagination
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;

        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        if (search.trim()) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { businessName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phoneNumber: { $regex: search, $options: "i" } },
                { primaryObjective: { $regex: search, $options: "i" } },
            ];
        }

        if (isCompleted !== "") {
            query.isCompleted = isCompleted === "true";
        }

        const [records, totalItems] = await Promise.all([
            BookDemo.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            BookDemo.countDocuments(query),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            totalItems,
            data: records,
        });
    } catch (error) {
        console.error("Get All BookDemo Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch book demo entries",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};

// ============================
// Get Single Book Demo
// ============================
const getBookDemoById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
            });
        }

        const entry = await BookDemo.findById(id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Book demo entry not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: entry,
        });
    } catch (error) {
        console.error("Get BookDemo By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch book demo entry",
            error: error.message,
        });
    }
};

// ============================
// Delete Book Demo
// ============================
const deleteBookDemo = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
            });
        }

        const deletedEntry = await BookDemo.findByIdAndDelete(id);

        if (!deletedEntry) {
            return res.status(404).json({
                success: false,
                message: "Book demo entry not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Book demo entry deleted successfully",
            data: deletedEntry,
        });
    } catch (error) {
        console.error("Delete BookDemo Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete book demo entry",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};

// ============================
// Update Status (isCompleted)
// ============================
const updateBookDemoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isCompleted } = req.body;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
            });
        }

        // Validate boolean
        if (typeof isCompleted !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isCompleted must be a boolean value",
            });
        }

        const updatedEntry = await BookDemo.findByIdAndUpdate(
            id,
            { isCompleted },
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({
                success: false,
                message: "Book demo entry not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: updatedEntry,
        });
    } catch (error) {
        console.error("Update BookDemo Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
    createBookDemo,
    getAllBookDemos,
    getBookDemoById,
    deleteBookDemo,
    updateBookDemoStatus,
};
