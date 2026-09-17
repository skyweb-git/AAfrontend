# 🔑 Firebase Admin SDK Setup Guide

## ❌ Current Error
```
FirebaseAppError: Failed to parse private key: Error: Invalid PEM formatted message.
```

This error occurs because the Firebase private key in `server/.env` is not a real, properly formatted private key.

## ✅ How to Fix

### Step 1: Generate Firebase Admin SDK Private Key

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `art-artist-2b001`
3. **Navigate to**: Project Settings ⚙️ > Service Accounts
4. **Click**: "Generate new private key" button
5. **Choose**: JSON (recommended)
6. **Download** the JSON file

### Step 2: Extract Private Key from JSON

Your downloaded JSON file will look like this:
```json
{
  "type": "service_account",
  "project_id": "art-artist-2b001",
  "private_key_id": "xxxxxxxxxxxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKwggSjAgEAAoIBAQC...\n...\n-----END PRIVATE KEY-----",
  "client_email": "firebase-adminsdk-xxxxx@art-artist-2b001.iam.gserviceaccount.com",
  "client_id": "xxxxxxxxxxxxxxxxxxxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

### Step 3: Update Server Environment Variables

#### Option A: Use JSON File (Recommended)
1. **Move** the downloaded JSON file to `server/` directory
2. **Rename** it to `service-account.json`
3. **Update** `server.js` to use the JSON file:

```javascript
// In server.js, replace the serviceAccount object with:
const serviceAccount = require('./service-account.json');
```

#### Option B: Manual Environment Variables
1. **Copy** the values from the JSON file
2. **Update** `server/.env` with real values:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=art-artist-2b001
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKwggSjAgEAAoIBAQC...\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@art-artist-2b001.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxx
```

## 🔧 Important Notes

### Private Key Format
- **Must include**: `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- **Must preserve**: All newlines (`\n`) in the key
- **No extra quotes**: The key should be wrapped in quotes but not modified
- **Complete key**: Copy the entire `private_key` value from JSON

### Common Mistakes
1. **Missing newlines**: Forgetting `\n` characters
2. **Extra spaces**: Adding spaces around the key
3. **Incomplete key**: Not copying the full private key
4. **Wrong format**: Using the wrong key format

## 🚀 After Setup

Once you have the correct Firebase credentials:

```bash
# Test the server
cd server
npm run dev
```

The server should start without the "Invalid PEM formatted message" error.

## 🔐 Security Best Practices

1. **Never commit** private keys to Git
2. **Use environment variables** in production
3. **Regenerate keys** if compromised
4. **Limit access** to only necessary permissions

## 📞 Need Help?

If you're still having trouble:

1. **Verify project ID**: Make sure you're using the right Firebase project
2. **Check key format**: Ensure proper PEM formatting
3. **Regenerate key**: Create a new private key if needed
4. **Check Firebase console**: Ensure project is active and properly configured

---

**Next Steps**: After fixing the Firebase credentials, your server should start successfully and you can test the authentication system!
