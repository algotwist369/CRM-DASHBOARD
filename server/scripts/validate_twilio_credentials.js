// Deep credential validation
require('dotenv').config();
const twilio = require('twilio');

console.log('🔍 DEEP CREDENTIAL ANALYSIS\n');
console.log('='.repeat(70));

const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// 1. Check if credentials exist
console.log('\n📋 Step 1: Credential Presence');
console.log('-'.repeat(70));
console.log('Account SID exists:', !!accountSid);
console.log('Auth Token exists:', !!authToken);

if (!accountSid || !authToken) {
    console.log('❌ CRITICAL: Missing credentials!');
    process.exit(1);
}

// 2. Check credential format
console.log('\n📋 Step 2: Credential Format Validation');
console.log('-'.repeat(70));

// Account SID should start with 'AC'
if (accountSid.startsWith('AC')) {
    console.log('✅ Account SID starts with "AC"');
} else {
    console.log('❌ WARNING: Account SID should start with "AC", got:', accountSid.substring(0, 2));
}

// Check for placeholder values
if (accountSid.includes('xxxx') || accountSid.includes('XXXX')) {
    console.log('🚨 CRITICAL: Account SID contains placeholder "xxx" values!');
    console.log('   This is NOT a real credential!');
    console.log('   Replace it with actual values from Twilio Console.');
    process.exit(1);
}

if (authToken.includes('xxxx') || authToken.includes('XXXX')) {
    console.log('🚨 CRITICAL: Auth Token contains placeholder "xxx" values!');
    console.log('   This is NOT a real credential!');
    console.log('   Replace it with actual values from Twilio Console.');
    process.exit(1);
}

console.log('✅ No placeholder values detected');

// 3. Check lengths
console.log('\n📋 Step 3: Credential Length Validation');
console.log('-'.repeat(70));
console.log('Account SID length:', accountSid.length, accountSid.length === 34 ? '✅' : '❌ Should be 34');
console.log('Auth Token length:', authToken.length, authToken.length === 32 ? '✅' : '❌ Should be 32');

// 4. Show partial credentials for verification
console.log('\n📋 Step 4: Partial Credential Display');
console.log('-'.repeat(70));
console.log('Account SID:', accountSid.substring(0, 8) + '...' + accountSid.substring(accountSid.length - 4));
console.log('Auth Token: ', authToken.substring(0, 4) + '...' + authToken.substring(authToken.length - 4));

// 5. Test actual authentication
console.log('\n📋 Step 5: Twilio API Authentication Test');
console.log('-'.repeat(70));

const client = twilio(accountSid, authToken);

async function testAuth() {
    try {
        console.log('Attempting to fetch account details...');
        const account = await client.api.v2010.accounts(accountSid).fetch();

        console.log('\n🎉 ✅ AUTHENTICATION SUCCESSFUL! 🎉\n');
        console.log('Account Details:');
        console.log('  Name:', account.friendlyName);
        console.log('  Status:', account.status);
        console.log('  Type:', account.type);
        console.log('  Created:', new Date(account.dateCreated).toLocaleDateString());

        console.log('\n✅ Your Twilio credentials are VALID and WORKING!');
        console.log('✅ The system should now send SMS/WhatsApp messages!');

    } catch (error) {
        console.log('\n❌ AUTHENTICATION FAILED!\n');
        console.log('Error Details:');
        console.log('  Code:', error.code);
        console.log('  Status:', error.status);
        console.log('  Message:', error.message);
        console.log('  More Info:', error.moreInfo);

        console.log('\n🔍 Diagnosis:');

        if (error.code === 20003) {
            console.log('\n❌ Error 20003: Invalid Credentials');
            console.log('\nThis means one of the following:');
            console.log('  1. The Account SID is incorrect');
            console.log('  2. The Auth Token is incorrect');
            console.log('  3. The credentials are from a different Twilio account');
            console.log('  4. The Twilio account has been suspended/deactivated');
            console.log('  5. Using Test credentials where Live are needed (or vice versa)');

            console.log('\n📝 Action Required:');
            console.log('  1. Go to https://console.twilio.com/');
            console.log('  2. Login to your account');
            console.log('  3. Copy the EXACT Account SID (starts with AC)');
            console.log('  4. Click "Show" on Auth Token and copy the EXACT value');
            console.log('  5. Update your .env file with these exact values');
            console.log('  6. Make sure there are NO quotes, spaces, or extra characters');
            console.log('\n  Example format in .env:');
            console.log('  TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcd');
            console.log('  TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcd');
        }
    }
}

testAuth();
