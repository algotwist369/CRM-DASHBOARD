const mongoose = require("mongoose");

const BookDemoSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        businessName: {
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
        teamSize: {
            type: String,
            required: true,
            trim: true,
        },
        primaryObjective: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true, // adds createdAt & updatedAt
        versionKey: false, // disable __v
    }
);

module.exports = mongoose.model("BookDemo", BookDemoSchema);
