const Manager = require("../models/Manager");
const logger = require("../utils/logger");

const addManager = async (req, res) => {
    try {
        const { location, whatsapp_number } = req.body;

        const manager = await Manager.create({
            location,
            whatsapp_number,
        });

        logger.info(`Manager added: ${whatsapp_number} for location: ${location}`);

        return res.status(201).json({
            success: true,
            message: "Manager added successfully",
            data: manager,
        });
    } catch (error) {
        logger.error("Add manager error:", error.message);

        // Handle duplicate key error
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Manager with this WhatsApp number already exists in this location",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to add manager",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

const getManagers = async (req, res) => {
    try {
        const managers = await Manager.find().sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: managers.length,
            data: managers,
        });
    } catch (error) {
        logger.error("Get managers error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch managers",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

const getManagersByLocation = async (req, res) => {
    try {
        const { location } = req.params;

        if (!location) {
            return res.status(400).json({
                success: false,
                message: "Location parameter is required",
            });
        }

        const managers = await Manager.find({
            location: location.toLowerCase().trim(),
        });

        return res.json({
            success: true,
            location: location.toLowerCase(),
            count: managers.length,
            data: managers,
        });
    } catch (error) {
        logger.error("Get managers by location error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch managers",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

const deleteManager = async (req, res) => {
    try {
        const { id } = req.params;

        const manager = await Manager.findByIdAndDelete(id);

        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Manager not found",
            });
        }

        logger.info(`Manager deleted: ${manager.whatsapp_number}`);

        return res.json({
            success: true,
            message: "Manager deleted successfully",
        });
    } catch (error) {
        logger.error("Delete manager error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to delete manager",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        });
    }
};

module.exports = {
    addManager,
    getManagers,
    getManagersByLocation,
    deleteManager,
};
