# Twilio SMS Setup Guide

## Common Twilio Errors and Solutions

### Error 21660: Phone Number Mismatch

**Error Message:**
```
Mismatch between the 'From' number +14155238886 and the account AC07a6f8c241a285a0dc2f65090466da4a
```

**Solution:**
1. Go to your Twilio Console: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Check which phone numbers are available in your account
3. Update your `.env` file with the correct phone number:
   ```env
   TWILIO_PHONE_NUMBER=+1234567890  # Use the exact number from your Twilio console
   ```
4. Make sure the phone number includes the `+` sign and country code
5. Restart your server

### Error 21211: Invalid Phone Number Format

**Solution:**
- Ensure recipient phone numbers are in E.164 format: `+[country code][number]`
- Example: `+917388480128` (India), `+1234567890` (US)

### Error 21614: Unverified Recipient (Trial Account)

**Solution:**
If you're using a Twilio trial account:
1. Go to Twilio Console → Phone Numbers → Verified Caller IDs
2. Add the recipient phone number
3. Verify it via SMS or call
4. Once verified, you can send SMS to that number

**Note:** Trial accounts can only send SMS to verified numbers.

### Error 21408: Permission Denied

**Solution:**
- Check your Twilio account permissions
- Ensure your account has SMS capabilities enabled
- Verify your account is not suspended

## Setup Steps

### 1. Get Twilio Credentials

1. Sign up at https://www.twilio.com/
2. Go to Console Dashboard
3. Copy your:
   - Account SID
   - Auth Token
   - Phone Number (from Phone Numbers section)

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14155238886  # Your Twilio phone number (must include +)
```

### 3. Verify Phone Number Format

- **Correct:** `+14155238886`
- **Wrong:** `14155238886` (missing +)
- **Wrong:** `(415) 523-8886` (formatted)

### 4. Test Configuration

The system will automatically:
- Log OTP to console if Twilio fails
- Continue working even if SMS fails (OTP saved in DB)
- Provide detailed error messages for troubleshooting

## Troubleshooting

### Check Twilio Phone Number

```bash
# In Twilio Console, go to:
Phone Numbers → Manage → Active Numbers
```

Copy the exact phone number shown (including + sign).

### Verify Account Status

1. Check Twilio Console Dashboard
2. Ensure account is active (not trial limitations)
3. Verify billing is set up (for production)

### Test with Twilio Console

1. Go to Twilio Console → Messaging → Try it out
2. Send a test SMS to verify your number works
3. If it works there but not in your app, check environment variables

## Production Considerations

1. **Upgrade from Trial: Trial accounts have limitations
2. Verify all recipient numbers (or upgrade account)
3. Set up billing for production use
4. Monitor usage and costs in Twilio Console

