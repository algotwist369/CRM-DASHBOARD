// Update .env file with valid credentials
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

console.log('📝 Updating .env file with valid Twilio credentials\n');
console.log('='.repeat(70));

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    let updatedLines = [];
    let sidUpdated = false;
    let tokenUpdated = false;

    for (let line of lines) {
        if (line.trim().startsWith('TWILIO_ACCOUNT_SID')) {
            updatedLines.push('TWILIO_ACCOUNT_SID=AC07a6f8c241a285a0dc2f65090466da4a');
            sidUpdated = true;
            console.log('✅ Updated TWILIO_ACCOUNT_SID');
        } else if (line.trim().startsWith('TWILIO_AUTH_TOKEN')) {
            updatedLines.push('TWILIO_AUTH_TOKEN=5c4e8d3b8c40485415a053d9a094510e');
            tokenUpdated = true;
            console.log('✅ Updated TWILIO_AUTH_TOKEN');
        } else {
            updatedLines.push(line);
        }
    }

    // Write back to file
    fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');

    console.log('\n' + '='.repeat(70));
    console.log('🎉 .env file updated successfully!');
    console.log('='.repeat(70));

    console.log('\n📋 Next Steps:');
    console.log('  1. Restart your server: npm run dev');
    console.log('  2. Test the credentials with: node scripts/validate_twilio_credentials.js');
    console.log('  3. You should see "✅ AUTHENTICATION SUCCESSFUL!"');
    console.log('  4. SMS/WhatsApp will now work! 📱');

} catch (error) {
    console.error('❌ Error updating .env file:', error.message);
}
