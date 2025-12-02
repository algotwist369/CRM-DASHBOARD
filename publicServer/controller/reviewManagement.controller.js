const ReviewManagement = require("../models/ReviewManagement.model");
const mongoose = require("mongoose");

// Create a Review Management Request
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

        // Extra safety validation
        if (!terms) {
            return res.status(400).json({ success: false, message: "You must agree to the terms." });
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

        res.status(201).json({
            success: true,
            message: "Review management request submitted successfully.",
            data: newRequest,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// Get All Requests (Pagination + Search)
const getReviewRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const query = {
            $or: [
                { businessName: { $regex: search, $options: "i" } },
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phoneNumber: { $regex: search, $options: "i" } },
                { reviewPlatform: { $regex: search, $options: "i" } },
            ],
        };

        const skip = (page - 1) * limit;

        const total = await ReviewManagement.countDocuments(query);
        const data = await ReviewManagement.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            success: true,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// Get Single Request by ID
const getReviewRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        const data = await ReviewManagement.findById(id);

        if (!data) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// Update Review Request
const updateReviewRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        const updatedData = await ReviewManagement.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedData) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.json({
            success: true,
            message: "Request updated successfully",
            data: updatedData,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// Delete Request
const deleteReviewRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        const deleted = await ReviewManagement.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.json({ success: true, message: "Request deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


module.exports = {
    createReviewRequest,
    getReviewRequests,
    getReviewRequestById,
    updateReviewRequest,
    deleteReviewRequest,
}