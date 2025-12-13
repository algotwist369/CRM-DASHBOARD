const nodemailer = require("nodemailer");
const path = require("path");

// Initialize SMTP transporter
let transporter = null;

// Initialize transporter based on environment variables
const initializeTransporter = () => {
    // Check if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465", // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                // Do not fail on invalid certs
                rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false"
            }
        });
        
        console.log("✅ SMTP transporter initialized");
        return true;
    }
    
    console.log("⚠️ SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env");
    return false;
};

// Initialize on module load
initializeTransporter();

// Get default from email
const getDefaultFrom = () => {
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
    const fromName = process.env.EMAIL_FROM_NAME || "CRM Dashboard";
    return `${fromName} <${fromEmail}>`;
};

// Send email function
exports.sendEmail = async (options) => {
    try {
        if (!transporter) {
            const initialized = initializeTransporter();
            if (!initialized) {
                throw new Error("SMTP is not configured. Please set SMTP credentials in .env");
            }
        }

        const {
            to,
            subject,
            text,
            html,
            cc,
            bcc,
            replyTo,
            attachments,
            from
        } = options;

        // Validate required fields
        if (!to || !subject || (!text && !html)) {
            throw new Error("Missing required fields: to, subject, and text/html are required");
        }

        // Prepare mail options
        const mailOptions = {
            from: from || getDefaultFrom(),
            to: Array.isArray(to) ? to.join(", ") : to,
            subject: subject,
            text: text,
            html: html || text, // Use HTML if provided, otherwise use text
            cc: cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : undefined,
            bcc: bcc ? (Array.isArray(bcc) ? bcc.join(", ") : bcc) : undefined,
            replyTo: replyTo || process.env.EMAIL_REPLY_TO,
            attachments: attachments || []
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
        
        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };
    } catch (error) {
        console.error("❌ Email sending failed:", error.message);
        throw error;
    }
};

// Send OTP email
exports.sendOtpEmail = async (to, otp, businessName) => {
    const subject = `Your OTP for ${businessName}`;
    const text = `Your OTP for ${businessName} is ${otp}. This OTP is valid for 5 minutes. Do not share this OTP with anyone.`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .otp-box { background-color: #fff; border: 2px dashed #4CAF50; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OTP Verification</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Your OTP for <strong>${businessName}</strong> is:</p>
                    <div class="otp-box">
                        <div class="otp-code">${otp}</div>
                    </div>
                    <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share this OTP with anyone.</p>
                    <p>If you did not request this OTP, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await exports.sendEmail({
        to,
        subject,
        text,
        html
    });
};

// Send welcome email
exports.sendWelcomeEmail = async (to, name) => {
    const subject = "Welcome to CRM Dashboard";
    const text = `Hello ${name}, Welcome to CRM Dashboard! We're excited to have you on board.`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome!</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Welcome to CRM Dashboard! We're excited to have you on board.</p>
                    <p>Thank you for joining us.</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>CRM Dashboard Team</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await exports.sendEmail({
        to,
        subject,
        text,
        html
    });
};

// Send notification email (for new leads, requests, etc.)
exports.sendNotificationEmail = async (to, title, message, actionUrl = null, actionText = "View Details") => {
    const subject = title;
    const text = `${title}\n\n${message}${actionUrl ? `\n\n${actionUrl}` : ""}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${title}</h1>
                </div>
                <div class="content">
                    <p>${message.replace(/\n/g, "<br>")}</p>
                    ${actionUrl ? `<a href="${actionUrl}" class="button">${actionText}</a>` : ""}
                </div>
                <div class="footer">
                    <p>Best regards,<br>CRM Dashboard Team</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await exports.sendEmail({
        to,
        subject,
        text,
        html
    });
};

// Send email with attachments
exports.sendEmailWithAttachments = async (to, subject, text, html, attachments) => {
    return await exports.sendEmail({
        to,
        subject,
        text,
        html,
        attachments
    });
};

// Verify SMTP connection
exports.verifyConnection = async () => {
    try {
        if (!transporter) {
            const initialized = initializeTransporter();
            if (!initialized) {
                return { success: false, message: "SMTP not configured" };
            }
        }

        await transporter.verify();
        return { success: true, message: "SMTP connection verified successfully" };
    } catch (error) {
        return { success: false, message: `SMTP verification failed: ${error.message}` };
    }
};

// Test email sending
exports.sendTestEmail = async (to) => {
    const subject = "Test Email from CRM Dashboard";
    const text = "This is a test email from CRM Dashboard. If you received this, your email configuration is working correctly.";
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Test Email</h1>
                </div>
                <div class="content">
                    <p>This is a test email from CRM Dashboard.</p>
                    <p>If you received this, your email configuration is working correctly.</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>CRM Dashboard Team</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await exports.sendEmail({
        to,
        subject,
        text,
        html
    });
};

module.exports = exports;

