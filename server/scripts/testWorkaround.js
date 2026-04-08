// scripts/testWorkaround.js
const { sendViaTwilio } = require('../utils/whatsappSender');
const { getSMSStatus } = require('../utils/sendSMS');
require('dotenv').config();

const targetPhone = '7388480128';
const generalSid = 'HXa007e399d81ed605989d1585091bed8a';

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
    console.log('--- Testing Senior Workaround: Using General Template for Pricing ---');
    try {
        const result = await sendViaTwilio(targetPhone, 'ignore', {
            contentSid: generalSid,
            contentVariables: {
                1: 'Ankit Workaround',
                2: 'Oceanic Spa HSR',
                3: 'Pricing Services Inquiry' // We put the specific type here
            }
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
