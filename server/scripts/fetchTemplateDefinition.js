// scripts/fetchTemplateDefinition.js
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sids = [
    'HXa007e399d81ed605989d1585091bed8a', // General
    'HXb5b80b2566ea1dff8d6c36c4741d56df'  // Pricing
];

(async () => {
    for (const sid of sids) {
        console.log(`\n--- Fetching Definition for ${sid} ---`);
        try {
            // Use the Content API
            const content = await client.content.v1.contents(sid).fetch();
            console.log('Friendly Name:', content.friendlyName);
            console.log('Language:', content.language);
            console.log('Variables:', JSON.stringify(content.variables, null, 2));
            console.log('Types:', JSON.stringify(content.types, null, 2));
        } catch (error) {
            console.error(`Failed to fetch ${sid}:`, error.message);
        }
    }
})();
