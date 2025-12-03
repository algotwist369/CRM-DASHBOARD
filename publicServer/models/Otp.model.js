const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        businessName: {
            type: String,
            required: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: "5m" } // auto delete after 5 minutes
        }
    },
    { versionKey: false }
);

module.exports = mongoose.model("Otp", OtpSchema);
