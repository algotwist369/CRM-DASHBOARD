require("dotenv").config();
const nodemailer = require("nodemailer");
const twilio = require("twilio");

// ---------- EMAIL ----------
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify transporter (optional)
emailTransporter.verify((err, success) => {
    if (err) {
        console.error("❌ Email transporter error:", err);
    } else {
        console.log("✅ Email transporter ready");
    }
});

// ---------- SMS ----------
const smsClient = twilio(
    process.env.TWILIO_SID || "your_twilio_sid",
    process.env.TWILIO_AUTH_TOKEN || "your_twilio_auth"
);

module.exports = {
    emailTransporter,
    smsClient,
};
