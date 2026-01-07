// Test provided credentials directly
const twilio = require('twilio');

const accountSid = 'AC07a6f8c241a285a0dc2f65090466da4a';
const authToken = '5c4e8d3b8c40485415a053d9a094510e';

console.log('🧪 Testing Provided Credentials\n');
console.log('='.repeat(70));
console.log('Account SID:', accountSid);
console.log('Auth Token: ', authToken.substring(0, 4) + '...' + authToken.substring(authToken.length - 4));
console.log('='.repeat(70));

const client = twilio(accountSid, authToken);

async function testAuth() {
    try {
        console.log('\nAttempting Twilio authentication...');
        const account = await client.api.v2010.accounts(accountSid).fetch();

        console.log('\n🎉 ✅ AUTHENTICATION SUCCESSFUL! 🎉\n');
        console.log('Account Details:');
        console.log('  Name:', account.friendlyName);
        console.log('  Status:', account.status);
        console.log('  Type:', account.type);

        console.log('\n✅ These credentials ARE VALID!');
        console.log('✅ Now updating your .env file...');

    } catch (error) {
        console.log('\n❌ AUTHENTICATION FAILED!\n');
        console.log('Error:', error.message);
        console.log('Code:', error.code);
        console.log('Status:', error.status);

        if (error.code === 20003) {
            console.log('\n❌ These credentials are also invalid.');
            console.log('Please double-check them at: https://console.twilio.com/');
        }
    }
}

testAuth();
