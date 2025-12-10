require('dotenv').config({ path: '../.env' });
const { sendTemplateWhatsApp, sendTemplateSMS } = require('../utils/sendSMS');

const testNotifications = async () => {
    console.log("Starting Notification Test...");

    const testData = {
        customerName: "Test User",
        businessName: "Test Business",
        appointmentDate: "2025-12-25",
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        services: "Test Service",
        confirmationCode: "TEST-123"
    };

    // Use a dummy number or the developer's number if available in env, else a safe dummy
    const testPhone = process.env.TEST_PHONE || "9876543210";

    console.log(`Testing with phone: ${testPhone}`);

    try {
        console.log("1. Testing WhatsApp...");
        await sendTemplateWhatsApp({
            to: testPhone,
            template: 'appointment_confirmation',
            data: testData
        });
        console.log("WhatsApp Test Executed (Check logs above for result)");
    } catch (error) {
        console.error("WhatsApp Test Failed:", error.message);
    }

    try {
        console.log("\n2. Testing SMS...");
        await sendTemplateSMS({
            to: testPhone,
            template: 'appointment_confirmation',
            data: testData
        });
        console.log("SMS Test Executed (Check logs above for result)");
    } catch (error) {
        console.error("SMS Test Failed:", error.message);
    }
};

testNotifications();
