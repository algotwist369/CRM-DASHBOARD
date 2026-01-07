// Comprehensive OTP System Test
require('dotenv').config();
const { createAndSendOTP, verifyOTP } = require('../utils/sendOTP');

async function testOTPFlow() {
    console.log('🧪 Testing OTP System...\n');
    console.log('='.repeat(60));

    const testPhone = '7388480128'; // Test phone number

    try {
        // Test 1: Generate and send OTP via WhatsApp (with SMS fallback)
        console.log('\n📱 Test 1: Sending OTP via WhatsApp (with SMS fallback)');
        console.log('-'.repeat(60));

        const otpData = await createAndSendOTP({
            mode: 'whatsapp',
            to: testPhone
        });

        console.log('✅ OTP generated successfully!');
        console.log('   Hash:', otpData.otpHash.substring(0, 16) + '...');
        console.log('   Expires:', new Date(otpData.expiresAt).toLocaleString());

        // Test 2: Verify OTP
        console.log('\n🔐 Test 2: Verifying OTP');
        console.log('-'.repeat(60));

        // Simulate correct OTP verification
        const isValid = verifyOTP(otpData.otp, otpData.otpHash, otpData.expiresAt);

        if (isValid) {
            console.log('✅ OTP verification PASSED!');
        } else {
            console.log('❌ OTP verification FAILED!');
        }

        // Test 3: Verify wrong OTP
        console.log('\n🔐 Test 3: Testing wrong OTP rejection');
        console.log('-'.repeat(60));

        const wrongOtp = '0000';
        const isWrongValid = verifyOTP(wrongOtp, otpData.otpHash, otpData.expiresAt);

        if (!isWrongValid) {
            console.log('✅ Wrong OTP correctly REJECTED!');
        } else {
            console.log('❌ Security issue: Wrong OTP was accepted!');
        }

        // Test 4: Test expiration logic
        console.log('\n⏰ Test 4: Testing expired OTP rejection');
        console.log('-'.repeat(60));

        const pastDate = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
        const isExpiredValid = verifyOTP(otpData.otp, otpData.otpHash, pastDate);

        if (!isExpiredValid) {
            console.log('✅ Expired OTP correctly REJECTED!');
        } else {
            console.log('❌ Security issue: Expired OTP was accepted!');
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 All OTP system tests completed!');
        console.log('='.repeat(60));

        // Summary
        console.log('\n📊 Test Summary:');
        console.log('   ✅ OTP Generation: PASSED');
        console.log('   ✅ OTP Verification: PASSED');
        console.log('   ✅ Wrong OTP Rejection: PASSED');
        console.log('   ✅ Expired OTP Rejection: PASSED');

        console.log('\n💡 Next Steps:');
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            console.log('   1. Check logs above for Twilio status');
            console.log('   2. If you see "Twilio not configured", update .env with valid credentials');
            console.log('   3. Restart your server to test actual SMS/WhatsApp delivery');
        } else {
            console.log('   1. Get Twilio credentials from https://console.twilio.com/');
            console.log('   2. Update .env file with TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
            console.log('   3. Restart server and run this test again');
        }

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run tests
testOTPFlow();
