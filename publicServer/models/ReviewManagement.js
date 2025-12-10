const mongoose = require("mongoose");

const ReviewManagementSchema = new mongoose.Schema(
    {
        businessName: {
            type: String,
            required: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{7,15}$/, "Invalid phone number"],
        },
        reviewPlatform: {
            type: String,
            required: true,
            trim: true,
        },
        targetReviewCount: {
            type: String,
            required: true,
            trim: true,
        },
        businessLink: {
            type: String,
            required: true,
            trim: true,
            match: [
                /^(https?:\/\/)?([\w.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                "Invalid review link URL",
            ],
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        terms: {
            type: Boolean,
            required: true,
        }
    },
    {
        timestamps: true,   // Adds createdAt & updatedAt
        versionKey: false,  // Removes __v
    }
);

module.exports = mongoose.model("ReviewManagement", ReviewManagementSchema);
