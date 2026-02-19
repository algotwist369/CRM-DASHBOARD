const mongoose = require("mongoose");
const FreeListing = require("../models/FreeListing");

const { processUploadedFiles } = require("../utils/uploadFiles");
const { sendNotificationEmail } = require("../utils/sendMail");

// =============================
// STEP 3: CREATE FREE LISTING (Allowed only if verified)
// =============================
exports.createFreeListing = async (req, res) => {
    try {
        let documentUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadedFiles = processUploadedFiles(req);
            documentUrls = uploadedFiles.map(file => file.url);
        }

        // Prepare listing data
        const {
            companyName,
            phoneNumber,
            fullName,
            email,
            businessType,
            businessName,
            branch,
            description,
            website,
            address,
            city,
            state,
            country,
            zipCode,
            category,
        } = req.body;

        const listingData = {
            companyName,
            phoneNumber,
            fullName,
            email,
            businessType,
            businessName,
            branch,
            description,
            website,
            address,
            city,
            state,
            country,
            zipCode,
            category,
            documents: documentUrls.length > 0 ? documentUrls : (req.body.documents || [])
        };

        // Create listing
        const entry = await FreeListing.create(listingData);

        // Send notification email (optional, won't fail if email fails)
        if (entry.email && process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false") {
            try {
                await sendNotificationEmail(
                    entry.email,
                    "Free Listing Created Successfully",
                    `Hello ${entry.fullName}, your free listing for ${entry.businessName} has been created successfully.`,
                    `${process.env.FRONTEND_URL || "http://localhost:5173"}/listings/${entry._id}`
                );
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
                // Don't fail the request if email fails
            }
        }

        res.status(201).json({
            success: true,
            message: "Free listing created successfully",
            data: entry,
        });
    } catch (error) {
        console.error("Create Free Listing Error:", error);

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
                message: "Duplicate entry. This listing already exists.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create listing",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};

// =============================
// GET ALL FREE LISTINGS (with search and filters)
// =============================
exports.getAllFreeListings = async (req, res) => {
    try {
        // Get query parameters
        let { page = 1, limit = 10, search = "", category = "", city = "", state = "" } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        // Validate pagination
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;

        // Calculate skip
        const skip = (page - 1) * limit;

        // Build search query
        const query = {};

        if (search.trim()) {
            query.$or = [
                { companyName: { $regex: search, $options: "i" } },
                { businessName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ];
        }

        if (category.trim()) {
            query.category = { $regex: category, $options: "i" };
        }

        if (city.trim()) {
            query.city = { $regex: city, $options: "i" };
        }

        if (state.trim()) {
            query.state = { $regex: state, $options: "i" };
        }

        // Get total count for pagination
        const totalListings = await FreeListing.countDocuments(query);

        // Fetch listings with pagination
        const listings = await FreeListing.find(query)
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
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};

// =============================
// GET SINGLE FREE LISTING BY ID
// =============================
exports.getFreeListingById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid listing ID format",
            });
        }

        const listing = await FreeListing.findById(id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Free listing not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: listing,
        });
    } catch (error) {
        console.error("Get Free Listing By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve listing",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};

// =============================
// UPDATE FREE LISTING
// =============================
exports.updateFreeListing = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid listing ID format",
            });
        }

        // Process uploaded files if any
        let documentUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadedFiles = processUploadedFiles(req);
            documentUrls = uploadedFiles.map(file => file.url);
        }

        // Prepare update data
        const updateData = { ...req.body };
        if (documentUrls.length > 0) {
            // Merge new documents with existing ones or replace
            const existingListing = await FreeListing.findById(id);
            if (existingListing && existingListing.documents) {
                updateData.documents = [...existingListing.documents, ...documentUrls];
            } else {
                updateData.documents = documentUrls;
            }
        }

        const updatedListing = await FreeListing.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedListing) {
            return res.status(404).json({
                success: false,
                message: "Free listing not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Free listing updated successfully",
            data: updatedListing,
        });
    } catch (error) {
        console.error("Update Free Listing Error:", error);

        // Handle validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update listing",
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
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
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid listing ID format",
            });
        }

        const deletedListing = await FreeListing.findByIdAndDelete(id);

        if (!deletedListing) {
            return res.status(404).json({
                success: false,
                message: "Free listing not found",
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
            error: process.env.DEBUG_MODE === "true" ? error.message : undefined,
        });
    }
};
