const Freelisting = require('../models/Freelisting.model');

// Get all freelistings - with pagination and filtering
const getAllFreelistings = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            search,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // Filter object
        let filter = {};

        // Category filter (matches your schema)
        if (category) {
            filter.business_category = category;
        }

        // Search (business name OR user name)
        if (search) {
            filter.$or = [
                { business_name: { $regex: search, $options: "i" } },
                { user_name: { $regex: search, $options: "i" } }
            ];
        }

        // Sorting
        const sortOrder = order === "asc" ? 1 : -1;

        // Query
        const freelistings = await Freelisting.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Freelisting.countDocuments(filter);

        // Optional: handle empty data
        if (freelistings.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No freelistings found",
                data: [],
                pagination: {
                    total: 0,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            message: "Freelistings fetched successfully",
            data: freelistings,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        console.error("Error:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching freelistings",
            error: error.message
        });
    }
};

// Create a new freelisting
const createFreelisting = async (req, res) => {
    try {
        const {
            user_name,
            user_phone,
            user_email,
            business_name,
            business_category,
            number_of_outlets,
            message
        } = req.body;

        //  Basic validation
        if (!user_name || !user_phone || !business_name || !business_category || !number_of_outlets) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        //  Optional: Prevent duplicate listing (same phone + business)
        const existing = await Freelisting.findOne({
            user_phone,
            business_name
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Freelisting already exists with this phone and business name"
            });
        }

        //  Create new freelisting
        const freelisting = await Freelisting.create({
            user_name: user_name.trim(),
            user_phone: user_phone,
            user_email: user_email?.trim(),
            business_name: business_name.trim(),
            business_category,
            number_of_outlets,
            message: message?.trim()
        });

        res.status(201).json({
            success: true,
            message: "Freelisting created successfully",
            data: freelisting
        });

    } catch (error) {
        console.error("Create Freelisting Error:", error);

        //  Mongoose validation error (like enum mismatch)
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Error creating freelisting",
            error: error.message
        });
    }
};

// Delete a freelisting
const deleteFreelisting = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Freelisting.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Freelisting not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Freelisting deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting freelisting",
            error: error.message
        });
    }
};

// delete all freelistings (for testing purposes only, not exposed in routes)
const deleteAllFreelistings = async (req, res) => {
    try {
        await Freelisting.deleteMany({});
        res.status(200).json({
            success: true,
            message: "All freelistings deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting all freelistings",
            error: error.message
        });
    }
};


module.exports = {
    getAllFreelistings,
    createFreelisting,
    deleteFreelisting,
    deleteAllFreelistings
};