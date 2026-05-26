# 📧 Gmail Setup for Production - Step by Step

## ✅ Code Updated - Now Supports Environment Variable!

The system now supports loading Gmail credentials from environment variable, making it easy for anyone to connect their Gmail.

---

## 🚀 Setup Steps on Render

### Step 1: Copy Gmail Credentials

Copy the contents from your `server/config/gmail-credentials.json` file and format it as a single line JSON (remove all line breaks).

**Note:** Make sure the redirect_uris array includes both localhost and production URLs:
- `http://localhost:5000/api/gmail/callback`
- `https://krp-attendance-project.onrender.com/api/gmail/callback`

### Step 2: Add to Render

1. Go to: https://dashboard.render.com
2. Select: **krp-attendance-project**
3. Click: **Environment** (left sidebar)
4. Click: **Add Environment Variable**
5. Add:
   - **Key:** `GMAIL_CREDENTIALS`
   - **Value:** Paste the JSON from Step 1
6. Click: **Save Changes**

### Step 3: Wait for Redeploy

Render will automatically redeploy (2-3 minutes).

### Step 4: Test Gmail Connection

1. Go to dashboard: https://krp-att-endance-project.vercel.app
2. Login with password: `krp@2024`
3. Gmail Status card should show "Disconnected"
4. Click: **"Connect Gmail"**
5. New window opens with Google login
6. Login with ANY Gmail account
7. Grant permissions
8. Window closes automatically
9. Dashboard shows "Connected" with email address

---

## 🎉 How It Works Now

### For Any User:

1. **Open Dashboard** → Login
2. **Click "Connect Gmail"** → Google login page opens
3. **Login with their Gmail** → Any Gmail account works!
4. **Grant permissions** → Allow sending emails
5. **Done!** → Their Gmail is connected
6. **Send Emails** → All emails sent from their Gmail

### Multi-User Support:

- ✅ Anyone can connect their own Gmail
- ✅ Each person uses their own email
- ✅ No hardcoded email addresses
- ✅ Easy to switch accounts (disconnect → connect with different email)

---

## 🔧 Technical Details

### What Changed:

**Before:**
- Credentials only loaded from file
- File not available on production
- Connection failed

**After:**
- Credentials loaded from environment variable OR file
- Environment variable works on production
- File works for local development
- Both methods supported

### Code Update:

```javascript
// gmailService.js - initialize()
if (process.env.GMAIL_CREDENTIALS) {
  // Production: Load from environment variable
  credentials = JSON.parse(process.env.GMAIL_CREDENTIALS);
} else if (fs.existsSync(this.credentialsPath)) {
  // Local: Load from file
  credentials = JSON.parse(fs.readFileSync(this.credentialsPath));
}
```

---

## 📋 Verification Checklist

After adding environment variable and redeployment:

- [ ] Render deployment successful
- [ ] Check Render logs for: `📧 Loading Gmail credentials from environment variable`
- [ ] Dashboard Gmail Status shows "Disconnected" (not error)
- [ ] Click "Connect Gmail" opens Google login
- [ ] After login, shows "Connected" with email
- [ ] Can send test email from Broadcast

---

## 🎯 Benefits

### For You:
- ✅ Easy to deploy
- ✅ No file management
- ✅ Secure (credentials in env variable)
- ✅ Works on any hosting platform

### For Users:
- ✅ Connect their own Gmail
- ✅ No technical knowledge needed
- ✅ Simple click-and-connect
- ✅ Can disconnect and reconnect anytime

### For System:
- ✅ Multi-user support
- ✅ No hardcoded emails
- ✅ Flexible and scalable
- ✅ Production-ready

---

## 🔐 Security Notes

1. **Environment Variable:**
   - Stored securely on Render
   - Not visible in code
   - Not in GitHub

2. **OAuth Tokens:**
   - Stored in database (future enhancement)
   - Each user has their own token
   - Automatically refreshed

3. **Permissions:**
   - Only "Send Email" permission requested
   - Cannot read emails
   - Cannot delete emails
   - Limited scope for security

---

## 🚨 Important: Update Redirect URI

The credentials JSON above already includes both:
- `http://localhost:5000/api/gmail/callback` (for local)
- `https://krp-attendance-project.onrender.com/api/gmail/callback` (for production)

If you need to add more redirect URIs:
1. Go to: https://console.cloud.google.com
2. Select project: **krp-admin-dashboard**
3. APIs & Services → Credentials
4. Edit OAuth 2.0 Client
5. Add redirect URI
6. Update GMAIL_CREDENTIALS environment variable

---

## 📞 Support

If connection fails:
1. Check Render logs for errors
2. Verify GMAIL_CREDENTIALS is set correctly
3. Ensure redirect URI includes production URL
4. Try disconnecting and reconnecting

---

**Status:** Ready to Deploy ✅
**Next Step:** Add GMAIL_CREDENTIALS to Render
**Time Required:** 5 minutes
