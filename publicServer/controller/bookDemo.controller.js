const BookDemo = require("../models/BookDemo");
const { bookDemoSchema } = require("../validators/bookDemo.validator");

// ============================
// Create Book Demo with Validation
// ============================
const createBookDemo = async (req, res) => {
    try {
        const validatedData = bookDemoSchema.parse(req.body);

        const newEntry = await BookDemo.create(validatedData);

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

        console.error("Create BookDemo Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit book demo request",
            error: error.message,
        });
    }
};

// ============================
// Get All Book Demos (Pagination)
// ============================
const getAllBookDemos = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;

        const [records, totalItems] = await Promise.all([
            BookDemo.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            BookDemo.countDocuments(),
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
            error: error.message,
        });
    }
};

// ============================
// Get Single Book Demo
// ============================
const getBookDemoById = async (req, res) => {
    try {
        const { id } = req.params;

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
        });
    } catch (error) {
        console.error("Delete BookDemo Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete book demo entry",
            error: error.message,
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
            { new: true }
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
            error: error.message,
        });
    }
};

module.exports = {
    createBookDemo,
    getAllBookDemos,
    getBookDemoById,
    deleteBookDemo,
    updateBookDemoStatus,
};
