// scripts/testPricingFix.js
const { sendInquiryWhatsApp } = require('../utils/whatsappSender');
const { getSMSStatus } = require('../utils/sendSMS');
require('dotenv').config();

const testUser = {
    customerName: 'ankit pricing test',
    phone: '7388480128',
    businessName: 'ELLA SPA MAHADEVAPURA',
    inquiryType: 'Pricing & Services',
    bookingUrl: 'https://spaadvisor.in/book/ella-spa'
};

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
    console.log('--- Testing Pricing Template Fix ---');
    try {
        const result = await sendInquiryWhatsApp(testUser);
        console.log(`Send Result:`, JSON.stringify(result, null, 2));

        if (result.success && result.messageId) {
            console.log(`Waiting 5 seconds for status...`);
            await delay(5000);
            const status = await getSMSStatus(result.messageId);
            console.log(`Final Status:`, JSON.stringify(status, null, 2));
        }
    } catch (error) {
        console.error(`Test failed:`, error);
    }
})();
