// DoubleTick.io API Key Test Script
// This script helps troubleshoot DoubleTick.io authentication issues

require('dotenv').config();
const axios = require('axios');

async function testDoubleTickAuth() {
    console.log('🔍 DoubleTick.io Authentication Diagnostics\n');
    console.log('='.repeat(70));

    // Check environment variables
    console.log('\n📋 Environment Configuration:');
    console.log('-'.repeat(70));

    const apiKey = process.env.DOUBLETICK_API_KEY;
    const fromNumber = process.env.DOUBLETICK_WHATSAPP_FROM;
    const templateName = process.env.DOUBLETICK_TEMPLATE_NAME;

    console.log(`API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : '❌ NOT SET'}`);
    console.log(`From Number: ${fromNumber || '❌ NOT SET'}`);
    console.log(`Template Name: ${templateName || '❌ NOT SET'}`);

    if (!apiKey || apiKey === 'your_api_key_here') {
        console.log('\n❌ ERROR: API Key not configured properly');
        console.log('\n💡 How to get your DoubleTick.io API Key:');
        console.log('   1. Login to https://doubletick.io');
        console.log('   2. Go to Settings → API Keys');
        console.log('   3. Copy your API key (starts with "key_")');
        console.log('   4. Update DOUBLETICK_API_KEY in .env file');
        console.log('   5. Restart the server');
        return;
    }

    // Test API authentication with a simple request
    console.log('\n🧪 Testing API Authentication...');
    console.log('-'.repeat(70));

    try {
        // Try to make a test API call
        // Note: DoubleTick.io might not have a dedicated test endpoint,
        // so we'll try to send a message and check the error type

        console.log('Making test API call to DoubleTick.io...');

        const testPayload = {
            templateName: templateName || 'otp_verification',
            from: fromNumber,
            to: '919999999999', // Dummy number for testing
            components: [
                {
                    type: 'body',
                    parameters: [
                        {
                            type: 'text',
                            text: '0000' // Test OTP
                        }
                    ]
                }
            ]
        };

        const response = await axios.post(
            'https://public.doubletick.io/whatsapp/message/template',
            testPayload,
            {
                headers: {
                    'Authorization': `key ${apiKey}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 10000,
                validateStatus: function (status) {
                    return status < 500; // Don't throw for 4xx errors
                }
            }
        );

        console.log(`\nAPI Response Status: ${response.status}`);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        if (response.status === 200 || response.status === 201) {
            console.log('\n✅ SUCCESS: API Key is valid!');
            console.log('   Message would be sent (dummy number used for testing)');
        } else if (response.status === 401) {
            console.log('\n❌ AUTHENTICATION FAILED: Invalid API Key');
            console.log('\n🔧 Troubleshooting Steps:');
            console.log('   1. Verify the API key in your DoubleTick.io dashboard');
            console.log('   2. Make sure you copied the ENTIRE key (it\'s quite long)');
            console.log('   3. Check for any extra spaces or quotes in .env file');
            console.log('   4. Ensure the API key hasn\'t been revoked or expired');
            console.log('   5. Try generating a new API key from the dashboard');
        } else if (response.status === 400) {
            console.log('\n⚠️  API Key is valid, but request has issues:');
            console.log('   Error:', response.data?.message);
            console.log('\n💡 Possible Issues:');
            console.log('   - Template name might be incorrect');
            console.log('   - Template might not be approved yet');
            console.log('   - Phone number format issue');
            console.log('\n✅ Good news: Your API key IS working!');
        } else if (response.status === 404) {
            console.log('\n⚠️  Template Not Found');
            console.log('   Template name:', templateName);
            console.log('\n💡 Action Required:');
            console.log('   1. Verify template name in DoubleTick.io dashboard');
            console.log('   2. Ensure template is approved by WhatsApp');
            console.log('   3. Update DOUBLETICK_TEMPLATE_NAME in .env');
        } else {
            console.log(`\n⚠️  Unexpected response: ${response.status}`);
            console.log('Response:', response.data);
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);

        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.log('\n💡 Network Error:');
            console.log('   - Check your internet connection');
            console.log('   - Verify DoubleTick.io API URL is correct');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('\n💡 Timeout Error:');
            console.log('   - API is taking too long to respond');
            console.log('   - Try again in a few moments');
        } else {
            console.log('\nFull error:', error);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('Diagnostics Complete\n');
}

// Run diagnostics
testDoubleTickAuth().then(() => {
    console.log('✨ Test completed.');
    process.exit(0);
}).catch((error) => {
    console.error('Test error:', error);
    process.exit(1);
});
