const axios = require("axios");
const Otp = require("../models/Otp.model");

// DoubleTick.io Configuration
const DOUBLETICK_API_KEY = process.env.DOUBLETICK_API_KEY;
const DOUBLETICK_WHATSAPP_FROM = process.env.DOUBLETICK_WHATSAPP_FROM;
const DOUBLETICK_TEMPLATE_NAME = process.env.DOUBLETICK_TEMPLATE_NAME || "otp_verificatoin";
const DOUBLETICK_API_URL = "https://public.doubletick.io/whatsapp/message/template";

// Random 6 digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via DoubleTick.io WhatsApp Template
 */
const sendOtpViaDoubleTick = async (phoneNumber, otp) => {
    if (!DOUBLETICK_API_KEY || !DOUBLETICK_WHATSAPP_FROM) {
        throw new Error("DoubleTick.io is not configured. Please set DOUBLETICK_API_KEY and DOUBLETICK_WHATSAPP_FROM in .env");
    }

    // Format phone number: remove non-digits
    let toPhone = phoneNumber.replace(/\D/g, "");

    // If 10 digits, assume Indian number and add 91
    if (toPhone.length === 10) {
        toPhone = `91${toPhone}`;
    }

    // DoubleTick expects number without '+' prefix (we already stripped it)

    const payload = {
        messages: [
            {
                from: DOUBLETICK_WHATSAPP_FROM.replace(/\D/g, ""),
                to: toPhone,
                content: {
                    language: "en",
                    templateName: DOUBLETICK_TEMPLATE_NAME,
                    templateData: {
                        body: {
                            placeholders: [otp] // OTP code as first placeholder
                        }
                    }
                }
            }
        ]
    };

    try {
        const response = await axios.post(DOUBLETICK_API_URL, payload, {
            headers: {
                "Authorization": DOUBLETICK_API_KEY,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            timeout: 10000
        });

        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                messageId: response.data?.messageId || response.data?.id || (response.data.messages && response.data.messages[0]?.messageId)
            };
        } else {
            throw new Error(`DoubleTick API returned status ${response.status}`);
        }
    } catch (error) {
        console.error("DoubleTick Error:", error.response?.data || error.message);
        const errorMsg = error.response?.data?.message || error.message;
        throw new Error(`Failed to send WhatsApp OTP: ${errorMsg}`);
    }
};

// Save OTP to DB & send using SMS API
exports.sendOtpToUser = async (phoneNumber, businessName) => {
    try {
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

        // Send OTP via DoubleTick
        if (DOUBLETICK_API_KEY && DOUBLETICK_WHATSAPP_FROM) {
            try {
                const result = await sendOtpViaDoubleTick(phoneNumber, otp);
                console.log(`✅ OTP sent successfully via DoubleTick to ${phoneNumber}. Message SID: ${result.messageId}`);
            } catch (dtError) {
                // Log detailed error
                console.error(`⚠️ Failed to send WhatsApp via DoubleTick: ${dtError.message}`);
                console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
                
                // In production, you might want to throw the error or handle it differently
                // For now, we'll continue since OTP is saved in DB
            }
        } else {
            // Fallback: Log OTP if DoubleTick is not configured (for development)
            console.log(`📱 OTP for ${phoneNumber}: ${otp} (DoubleTick not configured - set DOUBLETICK_API_KEY and DOUBLETICK_WHATSAPP_FROM in .env)`);
        }

        return otp;
    } catch (error) {
        console.error("Error in sendOtpToUser:", error);
        throw error;
    }
};

// Validate OTP
exports.verifyOtpCode = async (phoneNumber, otp) => {
    const record = await Otp.findOne({ phoneNumber, otp });

    if (!record) {
        return false;
    }

    // Check if OTP has expired
    if (record.expiresAt < new Date()) {
        await Otp.deleteOne({ _id: record._id });
        return false;
    }

    return true;
};

