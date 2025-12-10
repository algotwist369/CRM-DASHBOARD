const Otp = require("../models/Otp.model");
const twilio = require("twilio");

// Initialize Twilio Client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Random 6 digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format phone number for Twilio (E.164 format: +[country code][number])
const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
        throw new Error("Phone number is required");
    }

    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, "").trim();
    
    // If already in E.164 format (starts with +), validate and return
    if (cleaned.startsWith("+")) {
        // Remove + to check length
        const digitsOnly = cleaned.substring(1);
        if (digitsOnly.length < 10 || digitsOnly.length > 15) {
            throw new Error(`Invalid phone number length: ${cleaned}. Phone numbers must be 10-15 digits (excluding country code).`);
        }
        return cleaned;
    }
    
    // If no + prefix, determine country code based on length and patterns
    if (cleaned.length >= 10) {
        // Indian number patterns - PRIORITY: Check for Indian numbers first
        // Indian mobile numbers: 10 digits starting with 6, 7, 8, or 9
        if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
            // Indian mobile number (10 digits starting with 6-9)
            return `+91${cleaned}`;
        }
        
        // If 12 digits and starts with 91, it's Indian with country code
        if (cleaned.length === 12 && cleaned.startsWith("91") && /^91[6-9]\d{9}$/.test(cleaned)) {
            return `+${cleaned}`;
        }
        
        // If 13 digits and starts with 910, it's Indian with country code and leading 0
        if (cleaned.length === 13 && cleaned.startsWith("910") && /^910[6-9]\d{9}$/.test(cleaned)) {
            return `+91${cleaned.substring(2)}`;
        }
        
        // If 11 digits and starts with 0, it's Indian with leading 0
        if (cleaned.length === 11 && cleaned.startsWith("0") && /^0[6-9]\d{9}$/.test(cleaned)) {
            return `+91${cleaned.substring(1)}`;
        }
        
        // US/Canada number patterns (10 digits, or 11 digits starting with 1)
        if (cleaned.length === 10 && /^\d{10}$/.test(cleaned)) {
            // US/Canada number without country code - add +1
            return `+1${cleaned}`;
        } else if (cleaned.length === 11 && cleaned.startsWith("1") && /^1\d{10}$/.test(cleaned)) {
            // US/Canada number with country code
            return `+${cleaned}`;
        }
        
        // For other lengths (11-15 digits), assume country code is included
        if (cleaned.length >= 11 && cleaned.length <= 15) {
            return `+${cleaned}`;
        }
    }
    
    // If number is too short or invalid
    throw new Error(`Invalid phone number format: ${phoneNumber}. Please provide a valid phone number. Indian numbers should be 10 digits starting with 6-9.`);
};

// Send OTP via Twilio SMS
const sendSmsViaTwilio = async (phoneNumber, otp, businessName) => {
    if (!twilioClient) {
        throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env");
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
        throw new Error("TWILIO_PHONE_NUMBER is not set in .env");
    }

    // Format Twilio phone number (ensure it starts with +)
    // DO NOT modify the Twilio number - use it exactly as provided
    const formattedTwilioNumber = twilioPhoneNumber.startsWith("+") 
        ? twilioPhoneNumber 
        : `+${twilioPhoneNumber}`;

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const message = `Your OTP for ${businessName} is ${otp}. This OTP is valid for 5 minutes. Do not share this OTP with anyone.`;

    try {
        const messageResponse = await twilioClient.messages.create({
            body: message,
            from: formattedTwilioNumber,
            to: formattedPhone
        });

        return {
            success: true,
            messageSid: messageResponse.sid,
            status: messageResponse.status
        };
    } catch (error) {
        console.error("Twilio SMS Error:", error);
        
        // Handle specific Twilio errors
        if (error.code === 21660) {
            throw new Error(`Twilio phone number mismatch: The phone number ${formattedTwilioNumber} doesn't belong to your Twilio account. Please verify your TWILIO_PHONE_NUMBER in .env matches a number in your Twilio console.`);
        }
        
        if (error.code === 21211) {
            throw new Error(`Invalid phone number format: ${formattedPhone}. Please provide a valid phone number.`);
        }
        
        if (error.code === 21614) {
            throw new Error(`Unverified recipient: ${formattedPhone}. If using a Twilio trial account, you must verify recipient numbers in the Twilio console.`);
        }
        
        if (error.code === 21408) {
            throw new Error(`Permission denied: Your Twilio account doesn't have permission to send SMS to ${formattedPhone}.`);
        }
        
        // Generic error
        throw new Error(`Failed to send SMS: ${error.message} (Code: ${error.code || 'Unknown'})`);
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

        // Send OTP via Twilio
        if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
            try {
                const smsResult = await sendSmsViaTwilio(phoneNumber, otp, businessName);
                console.log(`✅ OTP sent successfully via Twilio to ${phoneNumber}. Message SID: ${smsResult.messageSid}`);
            } catch (smsError) {
                // Log detailed error
                console.error(`⚠️ Failed to send SMS via Twilio: ${smsError.message}`);
                console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
                
                // Log helpful troubleshooting info
                if (smsError.message.includes("mismatch") || smsError.message.includes("21660")) {
                    console.error(`\n🔧 Troubleshooting:`);
                    console.error(`   1. Check your Twilio Console: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming`);
                    console.error(`   2. Verify TWILIO_PHONE_NUMBER in .env matches a number in your Twilio account`);
                    console.error(`   3. Ensure the phone number format is correct (e.g., +14155238886)`);
                    console.error(`   4. If using a trial account, verify recipient numbers in Twilio console\n`);
                }
                
                // In production, you might want to throw the error or handle it differently
                // For now, we'll continue since OTP is saved in DB
            }
        } else {
            // Fallback: Log OTP if Twilio is not configured (for development)
            console.log(`📱 OTP for ${phoneNumber}: ${otp} (Twilio not configured - set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env)`);
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

