const mongoose = require("mongoose");

const VerifiedUserSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        businessName: {
            type: String,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
    },
    { versionKey: false }
);

module.exports = mongoose.model("VerifiedUser", VerifiedUserSchema);
