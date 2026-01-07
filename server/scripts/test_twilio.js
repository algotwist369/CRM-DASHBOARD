const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_PHONE;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

console.log('--- Twilio Configuration Check ---');
if (accountSid) {
    console.log(`TWILIO_ACCOUNT_SID: ${accountSid.substring(0, 4)}... (Length: ${accountSid.length})`);
    console.log(`SID Start Char Codes: ${[...accountSid.substring(0, 4)].map(c => c.charCodeAt(0)).join(',')}`);
    console.log(`SID End Char Codes: ${[...accountSid.substring(accountSid.length - 4)].map(c => c.charCodeAt(0)).join(',')}`);
} else {
    console.log('TWILIO_ACCOUNT_SID: MISSING');
}

if (authToken) {
    console.log(`TWILIO_AUTH_TOKEN: PRESENT (Length: ${authToken.length})`);
    console.log(`Token Start Char Codes: ${[...authToken.substring(0, 4)].map(c => c.charCodeAt(0)).join(',')}`);
    console.log(`Token End Char Codes: ${[...authToken.substring(authToken.length - 4)].map(c => c.charCodeAt(0)).join(',')}`);
} else {
    console.log('TWILIO_AUTH_TOKEN: MISSING');
}

if (!accountSid || !authToken) {
    console.error('CRITICAL: Missing credentials. Client cannot be initialized.');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

async function testAuth() {
    try {
        console.log('\n--- Attempting Twilio Account Authentication Test ---');
        // Simple fetch of account details to verify credentials
        const account = await client.api.v2010.accounts(accountSid).fetch();
        console.log('✅ Authentication SUCCESSFUL!');
        console.log('Account Name:', account.friendlyName);
        console.log('Account Status:', account.status);
    } catch (error) {
        console.error('❌ Authentication FAILED!');
        console.error('Error Code:', error.code);
        console.error('Status Code:', error.status);
        console.error('Message:', error.message);
        console.error('More Info:', error.moreInfo);

        if (error.code === 20003) {
            console.log('\nPossible reasons for 20003 (Authenticate):');
            console.log('1. Incorrect Account SID or Auth Token.');
            console.log('2. Extra spaces or quotes around variables in .env.');
            console.log('3. Using Test credentials for Live features (or vice versa).');
            console.log('4. The account has been suspended.');
        }
    }
}

testAuth();
