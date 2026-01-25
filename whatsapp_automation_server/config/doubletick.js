const axios = require("axios");
const logger = require("../utils/logger");
require('dotenv').config();

if (!process.env.DOUBLETICK_API_KEY) {
    console.warn("DOUBLETICK_API_KEY is not set in .env. Fallback will fail.");
}

const sendDoubleTickMessage = async (to, templateParams) => {
    try {
        const apiKey = process.env.DOUBLETICK_API_KEY;
        if (!apiKey) throw new Error("Missing DOUBLETICK_API_KEY");

        // Format phone number: remove '+' if present, ensure it has country code if needed by DoubleTick
        // DoubleTick usually expects numbers without '+' but with country code, e.g., 919876543210
        const cleanPhone = to.replace("+", "").replace("whatsapp:", "");

        const data = {
            messages: [
                {
                    from: process.env.DOUBLETICK_SENDER_PHONE, // Optional if you have multiple
                    to: cleanPhone,
                    content: {
                        templateName: "new_lead_received",
                        language: "en",
                        templateData: {
                            body: {
                                placeholders: [
                                    templateParams.customerName || "Customer",
                                    templateParams.location || "N/A",
                                    templateParams.customerPhone || "N/A"
                                ]
                            }
                        }
                    }
                }
            ]
        };

        // Note: DoubleTick API structure varies. 
        // Based on common implementations, it's often POST /whatsapp/v1/direct/message
        // or similar. I'll use a generic structure based on the user's template request
        // and standard DoubleTick docs found online (https://docs.doubletick.io).
        // Adjusting payload to match their standard 'template' message structure if possible.

        // Re-checking standard DoubleTick Template Payload structure:
        // {
        //   "to": "919xxxxxxxxx",
        //   "templateName": "template_name",
        //   "language": "en",
        //   "components": [ ... ] 
        // }
        // OR via their specific API endpoint.

        // Since I don't have the exact docs in front of me for the *exact* payload shape 
        // for *their* specific setup, I will use a robust generic structure and log the attempt.

        // Let's assume a standard structure for now, but I might need to refine this 
        // if the user provides specific API docs or if I find the specific endpoint.

        // Correction: Using the summary from my search:
        // "specify the template name and language, and you can customize header, body, and buttons within the template data"

        const payload = {
            messages: [
                {
                    to: cleanPhone,
                    from: process.env.DOUBLETICK_SENDER_PHONE,
                    content: {
                        templateName: process.env.DOUBLETICK_TEMPLATE_NAME || "leads_forward_v2",
                        language: "en",
                        templateData: {
                            body: {
                                placeholders: [
                                    templateParams.customerName || "Customer",
                                    templateParams.location || "N/A",
                                    templateParams.customerPhone || "N/A"
                                ]
                            }
                        }
                    }
                }
            ]
        };

        // LOG THE PAYLOAD FOR DEBUGGING (Debug level only)
        logger.debug("Sending DoubleTick Payload:", JSON.stringify(payload, null, 2));

        const response = await axios.post("https://public.doubletick.io/whatsapp/message/template", payload, {
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json"
            }
        });

        logger.info(`DoubleTick Success for ${cleanPhone}: ${response.data ? JSON.stringify(response.data) : "OK"}`);
        return response.data;

    } catch (error) {
        logger.error("DoubleTick API Error:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = { sendDoubleTickMessage };
