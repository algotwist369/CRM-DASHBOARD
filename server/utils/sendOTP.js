// Stateless OTP generation + simple verification helper.
// We produce an OTP and a server-side hash you can persist in DB (OTP collection).
// Hashing prevents storing OTP in plain text in DB.

const crypto = require('crypto');
const { sendMail } = require('./sendMail');
const { sendSMS, sendWhatsApp } = require('./sendSMS');

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
        await sendSMS({ to, message }); // may throw
    } else if (mode === 'whatsapp') {
        try {
            console.log(`[OTP] Attempting WhatsApp delivery to ${to} using template HX9bd6...`);
            const result = await sendWhatsApp({
                to,
                contentSid: 'HX9bd6542a11a4b04ab43f99275a8d41ea',
                contentVariables: { 1: otp }
            });

            if (!result || result.success === false) {
                const errorMsg = result?.message || result?.error || 'Unknown WhatsApp delivery error';
                throw new Error(errorMsg);
            }
            console.log(`[OTP] WhatsApp delivery signaled success: ${result.messageId}`);
        } catch (error) {
            console.warn(`[OTP] WhatsApp delivery failed: ${error.message}. Falling back to SMS...`);
            // Senior Fallback: If WhatsApp fails (invalid number, session closed, or config error), send traditional SMS.
            await sendSMS({ to, message });
            console.log(`[OTP] SMS Fallback delivered successfully.`);
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
