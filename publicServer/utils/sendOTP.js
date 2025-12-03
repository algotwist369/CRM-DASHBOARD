const Otp = require("../models/Otp.model");

// Random 6 digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to DB & send using SMS API
exports.sendOtpToUser = async (phoneNumber, businessName) => {
    const otp = generateOtp();

    // Remove old OTP for this number
    await Otp.deleteMany({ phoneNumber });

    // Save new OTP
    await Otp.create({
        phoneNumber,
        businessName,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 min
    });

    // TODO: Integrate SMS API like Twilio / MSG91 / Fast2SMS
    console.log(`OTP for ${phoneNumber}: ${otp} (Use SMS API in production)`);

    return otp;
};

// Validate OTP
exports.verifyOtpCode = async (phoneNumber, otp) => {
    const record = await Otp.findOne({ phoneNumber, otp });

    if (!record) {
        return false;
    }

    return true;
};

