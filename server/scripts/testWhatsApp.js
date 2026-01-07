// scripts/testWhatsApp.js
// Simple manual test for Twilio WhatsApp sending

require('dotenv').config();

const { sendWhatsApp } = require('../utils/sendSMS');

(async () => {
    try {
        const result = await sendWhatsApp({
            to: '7388480128', // your target number; sendSMS will auto-prefix +91 for 10-digit numbers
            message: 'Test WhatsApp message from CRM Dashboard (automated test)'
        });

        console.log('WhatsApp test result:', result);
    } catch (err) {
        console.error('WhatsApp test error:', err);
    }
})();



