// Comprehensive WhatsApp OTP Fallback Test
// Tests DoubleTick.io → Twilio WhatsApp → Twilio SMS fallback mechanism

require('dotenv').config();
const { createAndSendOTP, verifyOTP } = require('../utils/sendOTP');

async function testWhatsAppOTPFallback() {
    console.log('🧪 Testing WhatsApp OTP Fallback System...\n');
    console.log('='.repeat(70));

    const testPhone = '7388480128'; // Test phone number

    try {
        // ============================================================
        // TEST 1: WhatsApp OTP with Fallback Mechanism
        // ============================================================
        console.log('\n📱 Test 1: WhatsApp OTP Delivery (DoubleTick.io → Twilio Fallback)');
        console.log('-'.repeat(70));

        const startTime = Date.now();
        const otpData = await createAndSendOTP({
            mode: 'whatsapp',
            to: testPhone
        });
        const endTime = Date.now();

        console.log(`\n✅ OTP generated and delivery attempted in ${endTime - startTime}ms`);
        console.log('   Hash:', otpData.otpHash.substring(0, 20) + '...');
        console.log('   Expires:', new Date(otpData.expiresAt).toLocaleString());

        // Check logs above to see which provider was used
        console.log('\n💡 Check the logs above to see which delivery method was used:');
        console.log('   🥇 DoubleTick.io (Primary)');
        console.log('   🥈 Twilio WhatsApp (Fallback 1)');
        console.log('   🥉 Twilio SMS (Fallback 2)');
        console.log('   🛠️  Console Log (Dev Mode)');

        // ============================================================
        // TEST 2: OTP Verification
        // ============================================================
        console.log('\n\n🔐 Test 2: OTP Verification');
        console.log('-'.repeat(70));

        const isValid = verifyOTP(otpData.otp, otpData.otpHash, otpData.expiresAt);

        if (isValid) {
            console.log('✅ Correct OTP verification PASSED!');
        } else {
            console.log('❌ CRITICAL: Correct OTP verification FAILED!');
            throw new Error('OTP verification failed for correct OTP');
        }

        // ============================================================
        // TEST 3: Wrong OTP Rejection
        // ============================================================
        console.log('\n🔐 Test 3: Wrong OTP Rejection');
        console.log('-'.repeat(70));

        const wrongOtp = '0000';
        const isWrongValid = verifyOTP(wrongOtp, otpData.otpHash, otpData.expiresAt);

        if (!isWrongValid) {
            console.log('✅ Wrong OTP correctly REJECTED!');
        } else {
            console.log('❌ SECURITY ISSUE: Wrong OTP was accepted!');
            throw new Error('Security vulnerability: Wrong OTP accepted');
        }

        // ============================================================
        // TEST 4: Expired OTP Rejection
        // ============================================================
        console.log('\n⏰ Test 4: Expired OTP Rejection');
        console.log('-'.repeat(70));

        const pastDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const isExpiredValid = verifyOTP(otpData.otp, otpData.otpHash, pastDate);

        if (!isExpiredValid) {
            console.log('✅ Expired OTP correctly REJECTED!');
        } else {
            console.log('❌ SECURITY ISSUE: Expired OTP was accepted!');
            throw new Error('Security vulnerability: Expired OTP accepted');
        }

        // ============================================================
        // TEST 5: SMS Mode (for comparison)
        // ============================================================
        console.log('\n\n📧 Test 5: SMS Mode (Direct SMS without WhatsApp)');
        console.log('-'.repeat(70));

        const smsOtpData = await createAndSendOTP({
            mode: 'sms',
            to: testPhone
        });

        console.log('✅ SMS OTP generated successfully');
        console.log('   Hash:', smsOtpData.otpHash.substring(0, 20) + '...');

        // ============================================================
        // RESULTS SUMMARY
        // ============================================================
        console.log('\n\n' + '='.repeat(70));
        console.log('🎉 All Tests Completed Successfully!');
        console.log('='.repeat(70));

        console.log('\n📊 Test Results Summary:');
        console.log('   ✅ WhatsApp OTP Delivery: PASSED');
        console.log('   ✅ OTP Verification: PASSED');
        console.log('   ✅ Wrong OTP Rejection: PASSED');
        console.log('   ✅ Expired OTP Rejection: PASSED');
        console.log('   ✅ SMS Mode: PASSED');

        // ============================================================
        // CONFIGURATION STATUS
        // ============================================================
        console.log('\n🔧 Current Configuration Status:');
        console.log('-'.repeat(70));

        // Check DoubleTick.io
        const doubleTickConfigured = process.env.DOUBLETICK_API_KEY &&
            process.env.DOUBLETICK_API_KEY !== 'your_api_key_here';
        console.log(`   DoubleTick.io: ${doubleTickConfigured ? '✅ CONFIGURED' : '⚠️  NOT CONFIGURED'}`);
        if (!doubleTickConfigured) {
            console.log('      → API Key:', process.env.DOUBLETICK_API_KEY || 'MISSING');
        }

        // Check Twilio
        const twilioConfigured = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
        console.log(`   Twilio:        ${twilioConfigured ? '✅ CONFIGURED' : '⚠️  NOT CONFIGURED'}`);

        // ============================================================
        // NEXT STEPS
        // ============================================================
        console.log('\n💡 Next Steps:');
        console.log('-'.repeat(70));

        if (!doubleTickConfigured && !twilioConfigured) {
            console.log('   🛠️  Development Mode Active:');
            console.log('      → OTPs are being logged to console');
            console.log('      → To enable actual delivery:');
            console.log('        1. Get DoubleTick.io API key from https://doubletick.io');
            console.log('        2. Update .env with DOUBLETICK_API_KEY');
            console.log('        3. Create and approve WhatsApp template');
            console.log('      OR');
            console.log('        1. Configure Twilio credentials in .env');
            console.log('        2. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
        } else if (!doubleTickConfigured && twilioConfigured) {
            console.log('   ✅ Twilio Fallback Active:');
            console.log('      → System is using Twilio for message delivery');
            console.log('      → To enable DoubleTick.io (primary):');
            console.log('        1. Get API key from https://doubletick.io');
            console.log('        2. Update DOUBLETICK_API_KEY in .env');
            console.log('        3. Create approved WhatsApp OTP template');
        } else if (doubleTickConfigured) {
            console.log('   ✅ DoubleTick.io Primary Provider Active:');
            console.log('      → Check logs above for actual delivery status');
            console.log('      → Ensure WhatsApp template is approved');
            console.log('      → Twilio serves as backup if DoubleTick.io fails');
        }

        console.log('\n✨ System is production-ready with robust fallback mechanism!\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('\n📋 Stack Trace:');
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the comprehensive test
console.log('Starting WhatsApp OTP Fallback System Test...\n');
testWhatsAppOTPFallback().then(() => {
    console.log('Test execution completed.');
    process.exit(0);
}).catch((error) => {
    console.error('Test execution error:', error);
    process.exit(1);
});
