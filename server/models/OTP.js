const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: { type: String, index: true },
        phone: { type: String, index: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
    },
    { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
