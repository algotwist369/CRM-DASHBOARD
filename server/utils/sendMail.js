const nodemailer = require('nodemailer');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const path = require('path');
require("dotenv").config();


const TEMPLATE_MAP = {
    'appointment_confirmation': 'appointmentConfirmation',
    'appointment_reminder': 'appointmentReminder',
    'promotional_offer': 'promotionalOffer',
    'new_booking_admin': 'newBookingAdmin',
    'new_booking_manager': 'newBookingManager',
    'new_inquiry_admin': 'newInquiryAdmin',
    'new_inquiry_manager': 'newInquiryManager',
    'appointment_cancelled': 'appointmentCancelled',
    'appointment_rescheduled': 'appointmentRescheduled',
    'appointment_status_update': 'appointmentStatusUpdate',
    'appointment_completed': 'appointmentCompleted',
    'birthday_greeting': 'birthdayGreeting',
    'anniversary_greeting': 'anniversaryGreeting',
    're_engagement': 'reEngagement'
};

// AWS SES Client instance
let sesClient = null;

// Singleton transporter instance for fallback
let transporterInstance = null;

// Queue Configuration
const QUEUE_CONCURRENCY = 5; // Process 5 emails at a time
const QUEUE_DELAY = 100; // Small delay between batches to relieve event loop
const emailQueue = [];
let isProcessingQueue = false;

const getSESClient = () => {
    if (sesClient) return sesClient;

    const awsRegion = process.env.AWS_SES_REGION || process.env.AWS_REGION;
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!awsRegion || !awsAccessKeyId || !awsSecretAccessKey) {
        if (!global.awsSESWarned) {
            console.warn('⚠️ AWS SES: Credentials missing. Will try SMTP fallback.');
            global.awsSESWarned = true;
        }
        return null;
    }

    sesClient = new SESClient({
        region: awsRegion,
        credentials: {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey
        }
    });

    console.log('✅ AWS SES: Client initialized');
    return sesClient;
};

const getTransporter = () => {
    if (transporterInstance) return transporterInstance;

    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!smtpUser || !smtpPass) {
        if (!global.mockEmailWarned) {
            console.warn('⚠️ EMAIL: Credentials missing. Emails will be MOCKED.');
            global.mockEmailWarned = true;
        }
        return null; // Mock mode
    }

    const transportConfig = process.env.SMTP_HOST
        ? {
            pool: true, // Enable pooling for high performance
            maxConnections: 5,
            maxMessages: 100,
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true' }
        }
        : {
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false }
        };

    transporterInstance = nodemailer.createTransport(transportConfig);

    transporterInstance.verify((error) => {
        if (error) {
            console.error('❌ EMAIL: Connection failed:', error.message);
            transporterInstance = null;
        } else {
            console.log('✅ EMAIL: Ready (Pooled Connection)');
        }
    });

    return transporterInstance;
};

/**
 * Compile template string
 */
const compileTemplate = (templateStr, data) => {
    if (!templateStr) return '';
    return templateStr.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
        return data[key] !== undefined && data[key] !== null ? data[key] : '';
    });
};

/**
 * Process the email queue
 */
const processQueue = async () => {
    if (isProcessingQueue || emailQueue.length === 0) return;
    isProcessingQueue = true;

    try {
        const batch = emailQueue.splice(0, QUEUE_CONCURRENCY);
        const sesClient = getSESClient();
        const transporter = getTransporter();

        if (sesClient) {
            // Use AWS SES
            await Promise.all(batch.map(async (item) => {
                try {
                    const params = {
                        Destination: {
                            ToAddresses: Array.isArray(item.options.to) ? item.options.to : [item.options.to]
                        },
                        Message: {
                            Body: {},
                            Subject: {
                                Data: item.options.subject,
                                Charset: 'UTF-8'
                            }
                        },
                        Source: process.env.AWS_SES_FROM_EMAIL || 'no-reply@spaadvisor.in'
                    };

                    if (item.options.text) {
                        params.Message.Body.Text = {
                            Data: item.options.text,
                            Charset: 'UTF-8'
                        };
                    }

                    if (item.options.html) {
                        params.Message.Body.Html = {
                            Data: item.options.html,
                            Charset: 'UTF-8'
                        };
                    }

                    const command = new SendEmailCommand(params);
                    const response = await sesClient.send(command);
                    console.log(`✅ AWS SES: Email sent to ${item.options.to} | MessageId: ${response.MessageId}`);
                    item.resolve({ success: true, messageId: response.MessageId, response: response });
                } catch (sesErr) {
                    console.error(`❌ AWS SES FAILED to ${item.options.to}:`, sesErr.message);
                    console.log(`🔄 Falling back to SMTP for ${item.options.to}`);
                    // Fallback to SMTP
                    try {
                        if (transporter) {
                            const info = await transporter.sendMail(item.options);
                            item.resolve({ success: true, messageId: info.messageId, response: info.response });
                        } else {
                            throw new Error('SMTP transporter also unavailable');
                        }
                    } catch (smtpErr) {
                        console.error(`❌ SMTP FAILED to ${item.options.to}:`, smtpErr.message);
                        console.log(`📧 MOCKING email to ${item.options.to}`);
                        item.resolve({ success: true, mock: true, messageId: `mock-${Date.now()}`, response: 'Mocked' });
                    }
                }
            }));
        } else if (transporter) {
            // Use SMTP
            await Promise.all(batch.map(async (item) => {
                try {
                    const info = await transporter.sendMail(item.options);
                    item.resolve({ success: true, messageId: info.messageId, response: info.response });
                } catch (err) {
                    console.error(`❌ EMAIL FAILED to ${item.options.to}:`, err.message);
                    item.resolve({ success: false, error: err.message });
                }
            }));
        } else {
            // Mock mode
            batch.forEach(item => {
                console.log(`📧 MOCK SENT to ${item.options.to} | Subject: ${item.options.subject}`);
                item.resolve({ success: true, mock: true, messageId: `mock-${Date.now()}`, response: 'Logged' });
            });
        }
    } catch (criticalErr) {
        console.error('❌ CRITICAL QUEUE ERROR:', criticalErr);
    } finally {
        isProcessingQueue = false;
        if (emailQueue.length > 0) {
            setTimeout(processQueue, QUEUE_DELAY);
        }
    }
};

/**
 * Enqueue email for sending
 */
const enqueueEmail = (mailOptions) => {
    return new Promise((resolve, reject) => {
        emailQueue.push({ options: mailOptions, resolve, reject });
        processQueue();
    });
};

/**
 * Send email (Queued)
 */
const sendMail = async (options) => {
    const mailOptions = {
        from: process.env.AWS_SES_FROM_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@spaadvisor.in',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments || []
    };

    return enqueueEmail(mailOptions);
};

/**
 * Send bulk emails
 */
const sendBulkMail = async (emails) => {
    // Simply map to individual queued calls
    return Promise.all(emails.map(email => sendMail(email)));
};

/**
 * Send email using a predefined template
 */
const sendTemplateMail = async (options) => {
    const { to, template, data = {} } = options;

    try {
        const templateName = TEMPLATE_MAP[template] || template;
        const templatePath = path.join(__dirname, '..', 'emailTemplates', `${templateName}.js`);

        let templateModule;
        try {
            templateModule = require(templatePath);
        } catch (err) {
            console.error(`❌ EMAIL: Template missing: ${templateName}`);
            return { success: false, error: 'Template not found' };
        }

        const templateData = { year: new Date().getFullYear(), ...data };
        const subjectWrapper = compileTemplate(templateModule.subject, templateData);
        const htmlWrapper = compileTemplate(templateModule.html, templateData);

        return sendMail({
            to,
            subject: subjectWrapper,
            html: htmlWrapper
        });

    } catch (error) {
        console.error(`❌ EMAIL ERROR (${template}):`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendMail,
    sendBulkMail,
    sendTemplateMail
};