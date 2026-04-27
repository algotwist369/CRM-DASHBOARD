// scripts/checkLatestTwilio.js
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const targetPhone = '+917388480128';

(async () => {
    console.log(`Checking latest messages for: ${targetPhone}`);
    try {
        const messages = await client.messages.list({
            to: `whatsapp:${targetPhone}`,
            limit: 5
        });

        console.log(`Found ${messages.length} recent messages.`);
        messages.forEach(msg => {
            console.log(`- SID: ${msg.sid}`);
            console.log(`  Date: ${msg.dateSent}`);
            console.log(`  Status: ${msg.status}`);
            console.log(`  Body Preview: ${msg.body.substring(0, 50)}...`);
            console.log(`  Direction: ${msg.direction}`);
            console.log(`  Error: ${msg.errorCode} ${msg.errorMessage || ''}`);
            console.log('---');
        });
    } catch (error) {
        console.error('Fetch failed:', error);
    }
})();
