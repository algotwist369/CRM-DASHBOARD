const mongoose = require("mongoose");

const FreeListingSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            trim: true,
        },
        phoneNumber: {
            type: String,
            match: [/^\d{7,15}$/, "Invalid phone number"],
        },
        fullName: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
        },
        businessType: {
            type: String,
            trim: true,
        },
        businessName: {
            type: String,
            trim: true,
        },
        branch: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            maxlength: 1000,
        },
        website: {
            type: String,
            trim: true,
            match: [
                /^(https?:\/\/)?([\w.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                "Invalid website URL",
            ],
        },
        address: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        zipCode: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            trim: true,
        },
        documents: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true, // Adds createdAt & updatedAt
        versionKey: false, // Removes __v field
    }
);

module.exports = mongoose.model("FreeListing", FreeListingSchema);
