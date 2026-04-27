const mongoose = require('mongoose');
require('dotenv').config();
const { createAndSendOTP } = require('../utils/sendOTP');

const run = async () => {
    try {
        console.log("Testing OTP Sending with 10-digit number...");

        // Use a dummy 10-digit number. Twilio might still reject it if it's invalid, 
        // but we are testing that it DOES NOT throw "Invalid 'To' Phone Number" due to format (missing +).
        // Using a valid-looking but likely unsendable number or your own testing number if available.
        // For safety, test with a 10 digit number.
        await createAndSendOTP({ mode: 'sms', to: '9999999999' });
        console.log("OTP Send Function Executed");

    } catch (e) {
        console.error("Script Error:", e.message);
    }
};

run();
