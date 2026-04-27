const crypto = require('crypto');
const { sendMail } = require('./sendMail');
const { sendWhatsAppOTPDoubleTick } = require('./sendWhatsAppDoubleTick');


const OTP_LENGTH = parseInt(process.env.OTP_LENGTH, 10) || 4;
const OTP_TTL_MIN = parseInt(process.env.OTP_TTL_MIN, 10) || 5; // minutes
const OTP_SECRET = process.env.OTP_SECRET || 'otp-secret-change-me';


const generateOTP = () => {
    const otp = Array.from({ length: OTP_LENGTH })
        .map(() => Math.floor(Math.random() * 10))
        .join('');

    console.log("Generated OTP:", otp);

    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000).toISOString();
    const hash = crypto
        .createHmac('sha256', OTP_SECRET)
        .update(`${otp}.${expiresAt}`)
        .digest('hex');

    // Persist otpHash + expiresAt + recipient (phone/email) in DB (OTP collection)
    return {
        otp,
        expiresAt,
        otpHash: hash,
    };
}


const verifyOTP = (otp, otpHash, expiresAt) => {
    if (!otp || !otpHash || !expiresAt) return false;
    const now = new Date();
    // Allow for Date object or string
    const expDate = new Date(expiresAt);
    if (now > expDate) return false;

    // Use ISO string for hashing to match generateOTP
    const expString = expDate.toISOString();

    const computed = crypto
        .createHmac('sha256', OTP_SECRET)
        .update(`${otp}.${expString}`)
        .digest('hex');

    // constant-time compare to avoid timing attacks
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(otpHash));
}

const createAndSendOTP = async ({ mode, to, template }) => {
    const { otp, expiresAt, otpHash } = generateOTP();
    const message = template ? `${template} ${otp}` : `Your verification OTP is ${otp}. It expires in ${OTP_TTL_MIN} minutes.`;

    if (mode === 'sms') {
        try {
            await sendSMS({ to, message });
        } catch (error) {
            // If Twilio fails (auth error, etc), log for development
            if (error.message.includes('Authenticate') || error.message.includes('not fully configured')) {
                console.log(`[OTP] ⚠️  Twilio not configured. OTP would be sent to ${to}:`);
                console.log(`[OTP] 📱 OTP CODE: ${otp}`);
                console.log(`[OTP] ⏰ Expires: ${new Date(expiresAt).toLocaleString()}`);
                // Don't throw - allow OTP to be used
            } else {
                throw error; // Re-throw unexpected errors
            }
        }
    } else if (mode === 'whatsapp') {
        let otpDelivered = false;

        // Single Tier: Use DoubleTick.io exclusively
        try {
            console.log(`[OTP] 🚀 Sending WhatsApp OTP via DoubleTick.io to ${to}...`);
            const result = await sendWhatsAppOTPDoubleTick({
                to,
                otp
            });

            if (result && result.success === true) {
                console.log(`[OTP] ✅ DoubleTick.io delivery successful: ${result.messageId}`);
                otpDelivered = true;
            } else {
                const errorMsg = result?.message || result?.error || 'DoubleTick.io delivery failed';
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error(`[OTP] ❌ DoubleTick.io delivery failed: ${error.message}`);
            // In development, you might still want to see the OTP in logs if configured
            if (process.env.NODE_ENV === 'development') {
                console.log(`[OTP] 📱 DEV MODE OTP for ${to}: ${otp}`);
                otpDelivered = true;
            }
        }

        if (!otpDelivered) {
            throw new Error('Failed to deliver OTP through any available channel');
        }

    } else if (mode === 'email') {
        await sendMail({ to, subject: 'Your OTP', text: message });
    } else {
        throw new Error('Invalid mode for createAndSendOTP');
    }

    return { otp, expiresAt, otpHash };
}

module.exports = {
    generateOTP,
    verifyOTP,
    createAndSendOTP,
};
