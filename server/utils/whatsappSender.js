const whatsappWebService = require('../services/whatsappWebService');
const { sendWhatsApp: sendTwilioWhatsApp } = require('./sendSMS');
const {
    General_Inquiry_Template,
    Pricing_Services_Inquiry_Template,
    Special_Offer_Inquiry_Template,
    Membership_Inquiry_Template
} = require('../whatsappTemplate/Inqury');
require('dotenv').config();

const sendInquiryWhatsApp = async (options) => {
    const { customerName, phone, businessName, inquiryType, bookingUrl } = options;

    // Prepare data for template
    const templateData = {
        customerName,
        businessName,
        inquiryType,
        bookingUrl
    };

    // Select appropriate template based on inquiry type
    let message;
    switch (inquiryType) {
        case 'Pricing & Services':
            message = Pricing_Services_Inquiry_Template(templateData);
            break;
        case 'Special Offers':
            message = Special_Offer_Inquiry_Template(templateData);
            break;
        case 'Membership Packages':
            message = Membership_Inquiry_Template(templateData);
            break;
        case 'General Inquiry':
        default:
            message = General_Inquiry_Template(templateData);
            break;
    }

    // Try WhatsApp Web.js first
    const isReady = await whatsappWebService.isReady();
    if (isReady) {
        try {
            console.log(`[WhatsApp Sender] Sending via WhatsApp Web to ${phone}`);
            const result = await whatsappWebService.sendMessage(phone, message);

            return {
                success: true,
                provider: 'whatsapp-web',
                messageId: result.messageId,
                timestamp: result.timestamp
            };
        } catch (error) {
            console.error('[WhatsApp Sender] WhatsApp Web failed:', error.message);
            console.log('[WhatsApp Sender] Falling back to Twilio...');

            // Fallback to Twilio
            return await sendViaTwilio(phone, message);
        }
    } else {
        console.log('[WhatsApp Sender] WhatsApp Web not ready. Using Twilio...');
        return await sendViaTwilio(phone, message);
    }
};


const sendViaTwilio = async (phone, message) => {
    try {
        const result = await sendTwilioWhatsApp({ to: phone, message });

        if (result.success) {
            return {
                success: true,
                provider: 'twilio',
                messageId: result.messageId,
                status: result.status
            };
        } else {
            // Twilio also failed or not configured
            console.warn('[WhatsApp Sender] Twilio WhatsApp also failed/unavailable');

            return {
                success: false,
                provider: 'none',
                error: 'No WhatsApp provider available',
                logged: true
            };
        }
    } catch (error) {
        console.error('[WhatsApp Sender] Twilio error:', error.message);

        return {
            success: false,
            provider: 'none',
            error: error.message,
            logged: true
        };
    }
};


const getWhatsAppStatus = async () => {
    const status = await whatsappWebService.getStatus();

    return {
        whatsappWeb: {
            enabled: process.env.WHATSAPP_WEB_ENABLED === 'true',
            ...status
        },
        twilioConfigured: !!(process.env.TWILIO_WHATSAPP_NUMBER)
    };
};

module.exports = {
    sendInquiryWhatsApp,
    getWhatsAppStatus
};
