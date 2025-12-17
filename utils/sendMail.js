 
const nodemailer = require('nodemailer');
require("dotenv").config();

// Create transporter (configure with your email service)
const createTransporter = () => {
    // Check if SMTP credentials are available (priority: SMTP_* > EMAIL_*)
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    
    if (!smtpUser || !smtpPass) {
        console.warn('Email credentials not configured, email will be logged instead of sent');
        return null;
    }
    
    // Check if custom SMTP host is configured
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                // Allow self-signed certificates (set SMTP_REJECT_UNAUTHORIZED=true to enforce strict validation)
                rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true'
            }
        });
    }
    
    // Use service-based configuration (Gmail, etc.)
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: smtpUser,
            pass: smtpPass
        },
        tls: {
            // Allow self-signed certificates for Gmail and other services
            rejectUnauthorized: false
        }
    });
};

/**
 * Send email
 */
const sendMail = async (options) => {
    try {
        const transporter = createTransporter();
        
        // If no transporter (missing credentials), log the email instead
        if (!transporter) {
            console.log('📧 EMAIL (Mock):');
            console.log(`To: ${options.to}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Content: ${options.html || options.text}`);
            console.log('---');
            
            return {
                success: true,
                messageId: 'mock-' + Date.now(),
                response: 'Email logged (credentials not configured)',
                mock: true
            };
        }
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments || []
        };
        
        const result = await transporter.sendMail(mailOptions);
        
        return {
            success: true,
            messageId: result.messageId,
            response: result.response
        };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

/**
 * Send bulk emails
 * @param {Array} emails - Array of email options
 * @returns {Promise} - Send results
 */
const sendBulkMail = async (emails) => {
    const results = [];
    
    for (const email of emails) {
        try {
            const result = await sendMail(email);
            results.push({ success: true, email: email.to, result });
        } catch (error) {
            results.push({ success: false, email: email.to, error: error.message });
        }
    }
    
    return results;
};

/**
 * Send email template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.template - Template name
 * @param {Object} options.data - Template data
 * @returns {Promise} - Send result
 */
const sendTemplateMail = async (options) => {
    const templates = {
        appointment_confirmation: {
            subject: 'Appointment Confirmation - {{businessName}}',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Appointment Confirmed!</h2>
                    <p>Dear {{customerName}},</p>
                    <p>Your appointment has been confirmed with {{businessName}}.</p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3>Appointment Details:</h3>
                        <p><strong>Date:</strong> {{appointmentDate}}</p>
                        <p><strong>Time:</strong> {{startTime}} - {{endTime}}</p>
                        <p><strong>Services:</strong> {{services}}</p>
                        <p><strong>Confirmation Code:</strong> {{confirmationCode}}</p>
                    </div>
                    <p>Please arrive 10 minutes before your appointment time.</p>
                    <p>Thank you for choosing {{businessName}}!</p>
                </div>
            `
        },
        appointment_reminder: {
            subject: 'Appointment Reminder - {{businessName}}',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Appointment Reminder</h2>
                    <p>Dear {{customerName}},</p>
                    <p>This is a reminder about your upcoming appointment with {{businessName}}.</p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3>Appointment Details:</h3>
                        <p><strong>Date:</strong> {{appointmentDate}}</p>
                        <p><strong>Time:</strong> {{startTime}} - {{endTime}}</p>
                        <p><strong>Services:</strong> {{services}}</p>
                    </div>
                    <p>We look forward to seeing you!</p>
                </div>
            `
        },
        promotional_offer: {
            subject: 'Special Offer - {{businessName}}',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e74c3c;">Special Offer Just for You!</h2>
                    <p>Dear {{customerName}},</p>
                    <p>{{businessName}} has a special offer just for you!</p>
                    <div style="background-color: #e74c3c; color: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                        <h3>{{offerTitle}}</h3>
                        <p style="font-size: 18px;">{{offerDescription}}</p>
                        <p style="font-size: 24px; font-weight: bold;">{{discountText}}</p>
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="{{actionUrl}}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">{{actionText}}</a>
                    </div>
                    <p>This offer is valid until {{expiryDate}}.</p>
                </div>
            `
        },
        new_booking_admin: {
            subject: 'New Appointment Booking - {{businessName}}',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Appointment Booking</h2>
                    <p>Dear Admin,</p>
                    <p>A new appointment has been booked for <strong>{{businessName}}</strong>.</p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3>Appointment Details:</h3>
                        <p><strong>Customer Name:</strong> {{customerName}}</p>
                        <p><strong>Customer Email:</strong> {{customerEmail}}</p>
                        <p><strong>Customer Phone:</strong> {{customerPhone}}</p>
                        <p><strong>Date:</strong> {{appointmentDate}}</p>
                        <p><strong>Time:</strong> {{startTime}} - {{endTime}}</p>
                        <p><strong>Services:</strong> {{services}}</p>
                        <p><strong>Confirmation Code:</strong> {{confirmationCode}}</p>
                        {{staffInfo}}
                        {{customerNotesInfo}}
                    </div>
                    <p>Please review and confirm the appointment details.</p>
                </div>
            `
        },
        new_booking_manager: {
            subject: 'New Appointment Booking - {{businessName}}',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Appointment Booking</h2>
                    <p>Dear Manager,</p>
                    <p>A new appointment has been booked for <strong>{{businessName}}</strong>.</p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3>Appointment Details:</h3>
                        <p><strong>Customer Name:</strong> {{customerName}}</p>
                        <p><strong>Customer Email:</strong> {{customerEmail}}</p>
                        <p><strong>Customer Phone:</strong> {{customerPhone}}</p>
                        <p><strong>Date:</strong> {{appointmentDate}}</p>
                        <p><strong>Time:</strong> {{startTime}} - {{endTime}}</p>
                        <p><strong>Services:</strong> {{services}}</p>
                        <p><strong>Confirmation Code:</strong> {{confirmationCode}}</p>
                        {{staffInfo}}
                        {{customerNotesInfo}}
                    </div>
                    <p>Please prepare for the appointment.</p>
                </div>
            `
        }
    };
    
    const template = templates[options.template];
    if (!template) {
        throw new Error(`Template '${options.template}' not found`);
    }
    
    // Replace template variables
    let subject = template.subject;
    let html = template.html;
    
    Object.keys(options.data).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = options.data[key] || ''; // Handle null/undefined as empty string
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        html = html.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return sendMail({
        to: options.to,
        subject: subject,
        html: html
    });
};

module.exports = {
    sendMail,
    sendBulkMail,
    sendTemplateMail
};