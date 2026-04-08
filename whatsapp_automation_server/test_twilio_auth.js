require("dotenv").config();
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log("--- Credential Inspection ---");
console.log(`SID Length: ${accountSid ? accountSid.length : 'NULL'}`);
console.log(`Token Length: ${authToken ? authToken.length : 'NULL'}`);

if (accountSid) {
    console.log(`SID First Char: '${accountSid[0]}' Code: ${accountSid.charCodeAt(0)}`);
    console.log(`SID Last Char: '${accountSid[accountSid.length - 1]}' Code: ${accountSid.charCodeAt(accountSid.length - 1)}`);
}

if (authToken) {
    console.log(`Token First Char: '${authToken[0]}' Code: ${authToken.charCodeAt(0)}`);
    console.log(`Token Last Char: '${authToken[authToken.length - 1]}' Code: ${authToken.charCodeAt(authToken.length - 1)}`);
}

const cleanedSid = accountSid ? accountSid.trim() : "";
const cleanedToken = authToken ? authToken.trim() : "";

const client = twilio(cleanedSid, cleanedToken);

async function testAuth() {
    try {
        console.log("\nAttempting to send a test message...");
        // Using a dummy 'to' number, expecting a different error than 20003 if Auth passes
        // If Auth fails to catch 20003, we know it's purely credentials.
        await client.messages.create({
            body: "Test Auth",
            from: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886", // sandbox default
            to: process.env.TWILIO_WHATSAPP_NUMBER // Sending to self for test
        });
        console.log("✅ Authentication Successful (Message queued/sent)!");
    } catch (error) {
        if (error.code === 20003) {
            console.error("❌ Authentication Failed (20003): The Credentials are definitely invalid.");
        } else {
            console.log(`✅ Authentication Passed! (Received error code ${error.code} which proves Auth worked)`);
            console.log(`   Error was: ${error.message}`);
        }
    }
}

testAuth();
