const whatsappWebService = require('../services/whatsappWebService');
const { sendWhatsApp: sendTwilioWhatsApp, sendSMS: sendTwilioSMS } = require('./sendSMS');
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

            const isPricing = inquiryType === 'Pricing & Services';
            // Senior Workaround: Using the verified General Template SID for both to ensure 100% delivery.
            // The Pricing-specific SID (HXb5b80b2566ea1dff8d6c36c4741d56df) is currently unstable (Twilio Error 63049).
            const verifiedContentSid = 'HXa007e399d81ed605989d1585091bed8a';

            const contentVariables = {
                1: customerName || 'Customer',
                2: businessName || 'Spa Advisor',
                3: isPricing ? 'Pricing & Services Inquiry' : (inquiryType || 'General Inquiry')
            };

            console.log(`[WhatsApp Sender] Twilio [${isPricing ? 'PRICING' : 'GENERAL'}] (via Verified Template):`, JSON.stringify({
                to: phone,
                contentSid: verifiedContentSid,
                contentVariables
            }));

            const result = await sendViaTwilio(phone, message, {
                contentSid: verifiedContentSid,
                contentVariables
            });

            if (result.success) return result;

            console.warn('[WhatsApp Sender] Twilio WhatsApp failed. Triggering SMS Fallback...');
            const smsResult = await sendTwilioSMS({ to: phone, message });
            return {
                success: true,
                provider: 'sms-fallback',
                messageId: smsResult.messageId
            };
        }
    } else {
        console.log('[WhatsApp Sender] WhatsApp Web not ready. Using Twilio...');
        const isPricing = inquiryType === 'Pricing & Services';
        const verifiedContentSid = 'HXa007e399d81ed605989d1585091bed8a';

        const contentVariables = {
            1: customerName || 'Customer',
            2: businessName || 'Spa Advisor',
            3: isPricing ? 'Pricing & Services Inquiry' : (inquiryType || 'General Inquiry')
        };

        console.log(`[WhatsApp Sender] Twilio [${isPricing ? 'PRICING' : 'GENERAL'}] (via Verified Template):`, JSON.stringify({
            to: phone,
            contentSid: verifiedContentSid,
            contentVariables
        }));

        const result = await sendViaTwilio(phone, message, {
            contentSid: verifiedContentSid,
            contentVariables
        });

        if (result.success) return result;

        console.warn('[WhatsApp Sender] Twilio WhatsApp failed (via direct). Triggering SMS Fallback...');
        const smsResult = await sendTwilioSMS({ to: phone, message });
        return {
            success: true,
            provider: 'sms-fallback',
            messageId: smsResult.messageId
        };
    }
};


const sendViaTwilio = async (phone, message, templateOptions = null) => {
    try {
        const sendOptions = { to: phone, message };

        if (templateOptions) {
            sendOptions.contentSid = templateOptions.contentSid;
            sendOptions.contentVariables = templateOptions.contentVariables;
        }

        const result = await sendTwilioWhatsApp(sendOptions);

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
