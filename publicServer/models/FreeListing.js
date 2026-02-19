const mongoose = require("mongoose");

const FreeListingSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{7,15}$/, "Invalid phone number"],
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
        businessType: {
            type: String,
            required: true,
            trim: true,
        },
        businessName: {
            type: String,
            required: true,
            trim: true,
        },
        branch: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            maxlength: 1000,
        },
        website: {
            type: String,
            required: true,
            trim: true,
            match: [
                /^(https?:\/\/)?([\w.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                "Invalid website URL",
            ],
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        },
        zipCode: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        documents: {
            type: [String],
            required: true,
            default: [],
        },
    },
    {
        timestamps: true, // Adds createdAt & updatedAt
        versionKey: false, // Removes __v field
    }
);

module.exports = mongoose.model("FreeListing", FreeListingSchema);
