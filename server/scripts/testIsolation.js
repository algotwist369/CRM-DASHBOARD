// scripts/testIsolation.js
const { sendInquiryWhatsApp } = require('../utils/whatsappSender');
const { getSMSStatus } = require('../utils/sendSMS');
require('dotenv').config();

const targetPhone = '7388480128';

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
    console.log('--- Isolation Test: Using Known Good Variables ---');
    try {
        const result = await sendInquiryWhatsApp({
            customerName: 'ankit pathak',
            phone: targetPhone,
            businessName: 'Spa Advisor Test',
            inquiryType: 'Pricing & Services'
        });
        console.log(`Result:`, JSON.stringify(result, null, 2));

        if (result.success && result.messageId) {
            console.log(`Waiting for status...`);
            await delay(10000);
            const status = await getSMSStatus(result.messageId);
            console.log(`Final Status:`, JSON.stringify(status, null, 2));
        }
    } catch (error) {
        console.error(`Test failed:`, error);
    }
})();
