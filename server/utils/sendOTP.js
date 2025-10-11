// Stateless OTP generation + simple verification helper.
// We produce an OTP and a server-side hash you can persist in DB (OTP collection).
// Hashing prevents storing OTP in plain text in DB.

const crypto = require('crypto');
const { sendMail } = require('./sendMail');
const { sendSMS } = require('./sendSMS');

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH, 10) || 4;
const OTP_TTL_MIN = parseInt(process.env.OTP_TTL_MIN, 10) || 10; // minutes
const OTP_SECRET = process.env.OTP_SECRET || 'otp-secret-change-me';

/**
 * Generate numeric OTP and a hash that you can persist.
 * @returns {Object} { otp, expiresAt, otpHash }
 */
const generateOTP = () => {
    const otp = Array.from({ length: OTP_LENGTH })
        .map(() => Math.floor(Math.random() * 10))
        .join('');

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

/**
 * Verify provided otp against stored hash and expiry
 * @param {string} otp
 * @param {string} otpHash - stored hashed value
 * @param {string} expiresAt - ISO string
 * @returns {boolean}
 */
const verifyOTP = (otp, otpHash, expiresAt) => {
    if (!otp || !otpHash || !expiresAt) return false;
    const now = new Date();
    if (now > new Date(expiresAt)) return false;

    const computed = crypto
        .createHmac('sha256', OTP_SECRET)
        .update(`${otp}.${expiresAt}`)
        .digest('hex');

    // constant-time compare to avoid timing attacks
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(otpHash));
}

/**
 * Helper to send OTP by SMS OR email. This function does NOT persist; caller must save hashed OTP & expiry to DB.
 * @param {Object} options
 * @param {'sms'|'email'} options.mode
 * @param {string} options.to
 * @param {string} options.template - optional text template or message prefix
 * @returns {Object} { otp, expiresAt, otpHash }
 */
const createAndSendOTP = async ({ mode, to, template }) => {
    const { otp, expiresAt, otpHash } = generateOTP();
    const message = template ? `${template} ${otp}` : `Your verification OTP is ${otp}. It expires in ${OTP_TTL_MIN} minutes.`;

    if (mode === 'sms') {
        await sendSMS(to, message); // may throw
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
