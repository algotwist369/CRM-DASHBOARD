// sendWhatsAppDoubleTick.js - DoubleTick.io WhatsApp API Integration
// Load environment variables first
require('dotenv').config();

const axios = require('axios');
const { withRetry } = require('./performanceHelper');

// DoubleTick.io API Configuration
const DOUBLETICK_API_KEY = process.env.DOUBLETICK_API_KEY;
const DOUBLETICK_WHATSAPP_FROM = process.env.DOUBLETICK_WHATSAPP_FROM;
const DOUBLETICK_TEMPLATE_NAME = process.env.DOUBLETICK_TEMPLATE_NAME || 'otp_verificatoin';
const DOUBLETICK_API_URL = 'https://public.doubletick.io/whatsapp/message/template';

// Configuration loaded from environment

/**
 * Send WhatsApp OTP via DoubleTick.io with retry logic
 */
const sendWhatsAppOTPDoubleTick = async (options) => {
    return withRetry(async () => {
        try {
            // Check if DoubleTick.io is configured
            if (!DOUBLETICK_API_KEY || !DOUBLETICK_WHATSAPP_FROM) {
                console.warn('[DoubleTick] Not configured:',
                    !DOUBLETICK_API_KEY ? '(Missing API Key)' : '',
                    !DOUBLETICK_WHATSAPP_FROM ? '(Missing Sender Number)' : ''
                );
                return {
                    success: false,
                    status: 'not_configured',
                    message: 'DoubleTick.io not configured'
                };
            }

            // Format phone number: ensure it's in international format
            let toPhone = options.to;

            // If 10 digits, assume Indian number and add +91
            if (toPhone && /^\d{10}$/.test(toPhone.toString())) {
                toPhone = `91${toPhone}`;
            }

            // Remove any + prefix for DoubleTick.io
            toPhone = toPhone.toString().replace(/^\+/, '');

            console.log(`[DoubleTick] 📱 Sending OTP to: ${toPhone}`);

            // Prepare request payload - DoubleTick.io format
            const payload = {
                messages: [
                    {
                        to: toPhone,
                        content: {
                            language: 'en',
                            templateName: options.templateName || DOUBLETICK_TEMPLATE_NAME,
                            templateData: {
                                body: {
                                    placeholders: [options.otp] // OTP code as first placeholder
                                }
                            }
                        }
                    }
                ]
            };

            // Make API request to DoubleTick.io
            const response = await axios.post(DOUBLETICK_API_URL, payload, {
                headers: {
                    'Authorization': DOUBLETICK_API_KEY,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });

            // Check response
            if (response.status === 200 || response.status === 201) {
                return {
                    success: true,
                    messageId: response.data?.messageId || response.data?.id || 'doubletick-' + Date.now(),
                    status: 'sent',
                    provider: 'doubletick'
                };
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }

        } catch (error) {
            // Handle specific error cases
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;

                // Don't retry on client errors (4xx)
                if (status >= 400 && status < 500) {
                    console.error('[DoubleTick] ❌ API Error (No Retry):', {
                        status,
                        message: errorData?.message || errorData?.error
                    });
                    return {
                        success: false,
                        status: 'error',
                        message: errorData?.message || 'Bad request'
                    };
                }
                
                throw new Error(`DoubleTick API error (${status}): ${errorData?.message || 'Unknown error'}`);
            } else if (error.request) {
                throw new Error('DoubleTick API timeout or network error');
            } else {
                throw error;
            }
        }
    }, 3, 1000, (err) => {
        // Only retry on network errors, timeouts, or 5xx server errors
        return !err.response || (err.response.status >= 500);
    });
};

/**
 * Send WhatsApp text message via DoubleTick.io (non-template)
 */
const sendWhatsAppTextDoubleTick = async (options) => {
    try {
        if (!DOUBLETICK_API_KEY || !DOUBLETICK_WHATSAPP_FROM) {
            return {
                success: false,
                status: 'not_configured',
                message: 'DoubleTick.io not configured'
            };
        }

        let toPhone = options.to.toString().replace(/^\+/, '');
        if (/^\d{10}$/.test(toPhone)) {
            toPhone = `91${toPhone}`;
        }

        let fromPhone = DOUBLETICK_WHATSAPP_FROM.toString().replace(/^\+/, '');

        const payload = {
            from: fromPhone,
            to: toPhone,
            content: {
                text: options.message
            }
        };

        const response = await axios.post(
            'https://public.doubletick.io/whatsapp/message/text',
            payload,
            {
                headers: {
                    'Authorization': DOUBLETICK_API_KEY,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                messageId: response.data?.messageId || response.data?.id || 'doubletick-' + Date.now(),
                status: 'sent',
                provider: 'doubletick'
            };
        } else {
            throw new Error(`Unexpected status code: ${response.status}`);
        }

    } catch (error) {
        console.error('[DoubleTick] Text message error:', error.message);
        throw error;
    }
};

/**
 * Send WhatsApp Template Message via DoubleTick.io
 */
// const sendWhatsAppTemplateDoubleTick = async (options) => {
//     try {
//         if (!DOUBLETICK_API_KEY || !DOUBLETICK_WHATSAPP_FROM) {
//             console.warn('[DoubleTick] Not configured');
//             return { success: false, status: 'not_configured' };
//         }

//         console.log("[DoubleTick] 🔑 API Key:", DOUBLETICK_API_KEY ? "✅ Set" : "❌ Missing");
//         console.log("[DoubleTick] 📞 From:", DOUBLETICK_WHATSAPP_FROM || "❌ Missing");

//         // Format phone number: ensure it's in international format
//         let toPhone = options.to.toString().replace(/\D/g, '');

//         // If 10 digits, assume Indian number and add 91
//         if (toPhone.length === 10) {
//             toPhone = `91${toPhone}`;
//         }

//         // If it starts with 0, remove it (common mistake)
//         if (toPhone.startsWith('0') && toPhone.length === 11) {
//             toPhone = `91${toPhone.substring(1)}`;
//         }

//         if ((options.placeholders || []).length !== 3) {
//             console.warn(
//                 `[DoubleTick] ⚠ Placeholder count mismatch for template ${options.templateName}`
//             );
//         }

//         // DoubleTick expects the number without '+' prefix (we already stripped non-digits so + is gone)
//         // But strictly it should include country code.

//         console.log(`[DoubleTick] 📱 Sending Template to: ${toPhone} | Template: ${options.templateName}`);

//         const payload = {
//             messages: [
//                 {
//                     to: toPhone,
//                     content: {
//                         language: 'en',
//                         templateName: options.templateName,
//                         templateData: {
//                             body: {
//                                 placeholders: (options.placeholders || []).map(v =>
//                                     v === null || v === undefined ? '' : String(v)
//                                 )
//                             }
//                         }
//                     }
//                 }
//             ]
//         };

//         console.log('[DoubleTick] 📤 Payload:', JSON.stringify(payload, null, 2));

//         const response = await axios.post(DOUBLETICK_API_URL, payload, {
//             headers: {
//                 'Authorization': DOUBLETICK_API_KEY,
//                 'Content-Type': 'application/json'
//             },
//             timeout: 10000
//         });

//         console.log('[DoubleTick] Raw Response:', JSON.stringify(response.data));

//         if (response.status === 200 || response.status === 201) {
//             console.log(`[DoubleTick] ✅ Template Sent: ${response.data?.messageId || response.data?.id || 'OK'}`);
//             return {
//                 success: true,
//                 messageId: response.data?.messageId || response.data?.id,
//                 status: 'sent',
//                 data: response.data
//             };
//         } else {
//             throw new Error(`Unexpected status: ${response.status}`);
//         }

//     } catch (error) {
//         console.error('[DoubleTick] Template error:', error.message);
//         // Don't throw, just return failure so we don't crash the sync loop
//         return { success: false, error: error.message };
//     }
// };

const sendWhatsAppTemplateDoubleTick = async (options) => {
    try {
        // Required config values
        const apiKey = "key_9onXvzRfx3FBhw3GxJaNLtxkCMPufhtVHb3FDJILMKRRnbGBEIsU8BwNXDzxSuI8JuxXTxqti0KXpt3y5uRalhoV3jr6GbEmQ5P8lBJxRyqZVPPitlylgaDHSEJMn4bBvwlOE1kqsNXqM39FQyKOhcD3FPgtZYGCrjBHu0MNQgMKbfRVuTXl74FIYmUf8bPOPzhVk6gIETaV4yvfEP3pBwCgOEaidc8GwNDvk1dZlEkBgV2wyrcKHCKembko";
        const apiUrl = "https://public.doubletick.io/whatsapp/message/template";
        const senderNumber = "917506359139"; // Spa Advisor number (no +)


        // Prepare & normalize recipient
        let toPhone = options.to.toString().replace(/\D/g, '');

        // Add country code if needed
        if (/^\d{10}$/.test(toPhone)) {
            toPhone = "91" + toPhone;
        }
        toPhone = toPhone.replace(/^\+/, '');

        // Prepare placeholders safely
        const placeholders = (options.placeholders || []).map(v =>
            v === null || v === undefined ? "" : String(v)
        );

        // Construct correct payload per DoubleTick docs
        const payload = {
            messages: [
                {
                    from: senderNumber,
                    to: toPhone,
                    content: {
                        language: "en",
                        templateName: options.templateName || 'new_enquiry',
                        templateData: {
                            body: {
                                placeholders
                            }
                        }
                    }
                }
            ]
        };

        const response = await axios.post(apiUrl, payload, {
            headers: {
                Authorization: apiKey,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            timeout: 10000
        });

        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                messageId:
                    response.data?.messageId ||
                    response.data?.id ||
                    response.data.messages?.[0]?.messageId ||
                    "unknown"
            };
        }

        throw new Error(`Unexpected status code: ${response.status}`);
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};



module.exports = {
    sendWhatsAppOTPDoubleTick,
    sendWhatsAppTextDoubleTick,
    sendWhatsAppTemplateDoubleTick
};
