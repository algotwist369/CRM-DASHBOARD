const mongoose = require("mongoose");

const AdvertiseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        company: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{7,15}$/, "Invalid phone number"],
        },
        website: {
            type: String,
            required: false,
            trim: true,
            match: [
                /^(https?:\/\/)?([\w.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                "Invalid website URL",
            ],
        },
        budget: {
            type: String,
            required: true,
            trim: true,
        },
        timeline: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true, // Auto adds createdAt & updatedAt
        versionKey: false, // Removes __v
    }
);

module.exports = mongoose.model("Advertise", AdvertiseSchema);
