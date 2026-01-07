// scripts/compareTwilio.js
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const successSid = 'MM4d53a2db849cb22df4cb365574555d7c';
const failSid = 'MM9393094f3b2b2ca38db0879822629de4';

async function check(sid, label) {
    try {
        const msg = await client.messages(sid).fetch();
        console.log(`--- ${label} (${sid}) ---`);
        console.log('Status:', msg.status);
        console.log('Body:', msg.body);
        console.log('Error:', msg.errorCode);
    } catch (e) {
        console.error(`Failed to fetch ${sid}`, e.message);
    }
}

(async () => {
    await check(successSid, 'SUCCESSFUL');
    await check(failSid, 'FAILED');
})();
