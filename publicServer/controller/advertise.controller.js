const Advertise = require("../models/Advertise.model");
const mongoose = require("mongoose");

// ============================
// Create Advertise Lead
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

        res.status(201).json({
            success: true,
            message: "Advertise request submitted successfully",
            data: newLead,
        });
    } catch (error) {
        console.error("Create Advertise Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit advertise request",
            error: error.message,
        });
    }
};

// ============================
// Get All Advertise Leads (Pagination + Search)
// ============================
const getAllAdvertise = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const skip = (page - 1) * limit;

        const query = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { budget: { $regex: search, $options: "i" } },
                { timeline: { $regex: search, $options: "i" } },
            ],
        };

        const totalItems = await Advertise.countDocuments(query);

        const records = await Advertise.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            page: Number(page),
            limit: Number(limit),
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            data: records,
        });
    } catch (error) {
        console.error("Get All Advertise Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch advertise requests",
            error: error.message,
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
        res.status(500).json({
            success: false,
            message: "Failed to update advertise request",
            error: error.message,
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
        });
    } catch (error) {
        console.error("Delete Advertise Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete advertise request",
            error: error.message,
        });
    }
};


module.exports = {
    createAdvertise,
    getAllAdvertise,
    getAdvertiseById,
    updateAdvertise,
    deleteAdvertise,
}