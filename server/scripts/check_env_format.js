// Check .env file for common formatting issues
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
console.log('Checking .env file at:', envPath);
console.log('='.repeat(60));

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    let foundIssues = false;

    lines.forEach((line, index) => {
        if (line.trim().startsWith('TWILIO_')) {
            const lineNum = index + 1;
            console.log(`\nLine ${lineNum}: Checking Twilio variable`);

            // Check for quotes
            if (line.includes('"') || line.includes("'")) {
                console.log(`  ⚠️  WARNING: Contains quotes - remove them!`);
                console.log(`  Raw: ${JSON.stringify(line)}`);
                foundIssues = true;
            }

            // Check for spaces around =
            if (line.includes(' = ') || line.match(/=\s+/) || line.match(/\s+=/)) {
                console.log(`  ⚠️  WARNING: Spaces around = sign - remove them!`);
                console.log(`  Raw: ${JSON.stringify(line)}`);
                foundIssues = true;
            }

            // Check for trailing spaces
            if (line.trim() !== line.trimEnd()) {
                console.log(`  ⚠️  WARNING: Trailing spaces detected`);
                foundIssues = true;
            }

            // Show character codes for the value
            const parts = line.split('=');
            if (parts.length === 2) {
                const key = parts[0].trim();
                const value = parts[1].trim();

                console.log(`  Key: ${key}`);
                console.log(`  Value length: ${value.length}`);
                console.log(`  First 4 chars: ${[...value.substring(0, 4)].map(c => c.charCodeAt(0)).join(',')}`);
                console.log(`  Last 4 chars: ${[...value.substring(value.length - 4)].map(c => c.charCodeAt(0)).join(',')}`);

                // Check for non-ASCII characters
                for (let i = 0; i < value.length; i++) {
                    const code = value.charCodeAt(i);
                    if (code < 32 || code > 126) {
                        console.log(`  ⚠️  WARNING: Non-printable/special character at position ${i}: code ${code}`);
                        foundIssues = true;
                    }
                }
            }
        }
    });

    console.log('\n' + '='.repeat(60));
    if (!foundIssues) {
        console.log('✅ No formatting issues found in .env file');
        console.log('\n⚠️  If credentials are still failing, they are likely INVALID.');
        console.log('Please verify them at: https://console.twilio.com/');
    } else {
        console.log('❌ Formatting issues found! Fix them and restart your server.');
    }

} catch (error) {
    console.error('Error reading .env file:', error.message);
}
