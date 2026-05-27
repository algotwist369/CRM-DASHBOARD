const FreeListing = require("../models/FreeListingModel");
const Otp = require("../models/OTP");
const { createAndSendOTP, verifyOTP } = require("../utils/sendOTP");

const normalizePhone = (phone) => String(phone || "").replace(/[^0-9]/g, "");
const FREE_LISTING_ACCESS_CODE = "7388480128";

const hasValidAccessCode = (req) => {
    const code = req.body?.code || req.query?.code || req.headers["x-free-listing-code"];
    return String(code || "").trim() === FREE_LISTING_ACCESS_CODE;
};

const validateListingPayload = (payload) => {
    const errors = [];
    const phone = normalizePhone(payload.user_phone);
    const outlets = Number(payload.number_of_outlets);

    if (!payload.user_name || !payload.user_name.trim()) errors.push("Name is required");
    if (!phone || phone.length < 7 || phone.length > 15) errors.push("Valid phone number is required");
    if (!payload.business_name || !payload.business_name.trim()) errors.push("Business name is required");
    if (!payload.business_category) errors.push("Business category is required");
    if (!Number.isFinite(outlets) || outlets < 1) errors.push("Number of outlets must be at least 1");
    if (!payload.message || !payload.message.trim()) errors.push("Full address is required");

    return { errors, phone, outlets };
};

const getLatestOtpRecord = (phone) => Otp.findOne({
    phone,
    expiresAt: { $gt: new Date() }
}).sort({ createdAt: -1 });

const sendFreeListingOtp = async (req, res) => {
    try {
        const phone = normalizePhone(req.body.user_phone || req.body.phoneNumber || req.body.phone);

        if (!phone || phone.length < 7 || phone.length > 15) {
            return res.status(400).json({ success: false, message: "Valid phone number is required" });
        }

        const { expiresAt, otpHash } = await createAndSendOTP({ mode: "whatsapp", to: phone });

        await Otp.create({
            phone,
            otp: otpHash,
            metadata: { source: "free-listing" },
            expiresAt: new Date(expiresAt)
        });

        return res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to send OTP" });
    }
};

const verifyFreeListingOtp = async (req, res) => {
    try {
        const phone = normalizePhone(req.body.user_phone || req.body.phoneNumber || req.body.phone);
        const { otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
        }

        const otpRecord = await getLatestOtpRecord(phone).lean();
        if (!otpRecord || !verifyOTP(otp, otpRecord.otp, otpRecord.expiresAt)) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to verify OTP" });
    }
};

const createFreeListing = async (req, res) => {
    try {
        const { errors, phone, outlets } = validateListingPayload(req.body);
        const { otp } = req.body;

        if (!otp) errors.push("OTP is required");
        if (errors.length) {
            return res.status(400).json({ success: false, message: errors[0], errors });
        }

        const otpRecord = await getLatestOtpRecord(phone);
        if (!otpRecord || !verifyOTP(otp, otpRecord.otp, otpRecord.expiresAt)) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const listing = await FreeListing.create({
            user_name: req.body.user_name.trim(),
            user_phone: phone,
            business_name: req.body.business_name.trim(),
            user_email: req.body.user_email ? req.body.user_email.trim().toLowerCase() : undefined,
            business_category: req.body.business_category,
            number_of_outlets: outlets,
            message: req.body.message.trim(),
            otp_verified_at: new Date(),
            ip: req.ip,
            userAgent: req.get("user-agent")
        });

        await Otp.findByIdAndDelete(otpRecord._id);

        return res.status(201).json({
            success: true,
            message: "Free listing submitted successfully",
            data: listing
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to create free listing" });
    }
};

const getAllFreeListings = async (req, res) => {
    try {
        if (!hasValidAccessCode(req)) {
            return res.status(403).json({ success: false, message: "Invalid access code" });
        }

        const { page = 1, limit = 10, search, status } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { user_name: { $regex: search, $options: "i" } },
                { user_phone: { $regex: search, $options: "i" } },
                { business_name: { $regex: search, $options: "i" } }
            ];
        }

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        const [listings, total] = await Promise.all([
            FreeListing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
            FreeListing.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: listings,
            pagination: {
                total,
                page: parsedPage,
                limit: parsedLimit,
                pages: Math.ceil(total / parsedLimit)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch free listings" });
    }
};

const getFreeListingById = async (req, res) => {
    try {
        if (!hasValidAccessCode(req)) {
            return res.status(403).json({ success: false, message: "Invalid access code" });
        }

        const listing = await FreeListing.findById(req.params.id).lean();

        if (!listing) {
            return res.status(404).json({ success: false, message: "Free listing not found" });
        }

        return res.status(200).json({ success: true, data: listing });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch free listing" });
    }
};

const updateFreeListing = async (req, res) => {
    try {
        if (!hasValidAccessCode(req)) {
            return res.status(403).json({ success: false, message: "Invalid access code" });
        }

        const update = { ...req.body };
        delete update.code;

        if (update.status && !["pending", "contacted", "approved", "rejected"].includes(update.status)) {
            return res.status(400).json({ success: false, message: "Invalid listing status" });
        }

        if (update.user_phone) update.user_phone = normalizePhone(update.user_phone);
        if (update.user_email) update.user_email = update.user_email.trim().toLowerCase();

        const listing = await FreeListing.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true
        });

        if (!listing) {
            return res.status(404).json({ success: false, message: "Free listing not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Free listing updated successfully",
            data: listing
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to update free listing" });
    }
};

const deleteFreeListing = async (req, res) => {
    try {
        if (!hasValidAccessCode(req)) {
            return res.status(403).json({ success: false, message: "Invalid access code" });
        }

        const listing = await FreeListing.findByIdAndDelete(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, message: "Free listing not found" });
        }

        return res.status(200).json({ success: true, message: "Free listing deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to delete free listing" });
    }
};

module.exports = {
    sendFreeListingOtp,
    verifyFreeListingOtp,
    createFreeListing,
    getAllFreeListings,
    getFreeListingById,
    updateFreeListing,
    deleteFreeListing
};
