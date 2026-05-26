# 🚀 Render Update Steps - Gmail OAuth Fix

## What Was Fixed
The Gmail OAuth redirect issue has been fixed. The system now dynamically selects the correct redirect URI based on the environment.

## 📋 Steps to Update Render

### Step 1: Update GMAIL_CREDENTIALS Environment Variable

1. Go to: https://dashboard.render.com
2. Select your service: **krp-attendance-project**
3. Click: **Environment** (left sidebar)
4. Find: **GMAIL_CREDENTIALS** variable
5. Click: **Edit** (pencil icon)
6. Replace the value with the updated credentials that include BOTH redirect URIs:
   - Open your local file: `server/config/gmail-credentials.json`
   - Copy the entire content
   - Remove all line breaks to make it a single line
   - Paste into the GMAIL_CREDENTIALS value field
7. Click: **Save Changes**

### Step 2: Verify NODE_ENV

Make sure you have this environment variable set:
- **Key:** `NODE_ENV`
- **Value:** `production`

If it's not there, add it.

### Step 3: Wait for Automatic Redeploy

Render will automatically redeploy when you save environment variables (takes 2-3 minutes).

### Step 4: Check Deployment Logs

Once deployed, check the logs. You should see:
```
🔧 Using redirect URI: https://krp-attendance-project.onrender.com/api/gmail/callback (Production: true)
```

If you see `(Production: false)`, the NODE_ENV is not set correctly.

### Step 5: Test Gmail Connection

1. Go to: https://krp-att-endance-project.vercel.app
2. Login with password: `krp@2024`
3. Click: **Connect Gmail** button
4. You should be redirected to Google OAuth
5. After authorization, you should be redirected back to production URL (NOT localhost)
6. Dashboard should show "Connected" with your email

## ✅ What to Expect

### Before Fix:
- Clicking "Connect Gmail" redirected to `http://localhost:5000/api/gmail/callback`
- Connection failed with error

### After Fix:
- Clicking "Connect Gmail" redirects to `https://krp-attendance-project.onrender.com/api/gmail/callback`
- Connection succeeds
- Dashboard shows connected email

## 🔍 Troubleshooting

### If still redirecting to localhost:

1. **Check Render logs** - Look for the redirect URI being used
2. **Verify NODE_ENV** - Must be set to `production`
3. **Check GMAIL_CREDENTIALS** - Must include both redirect URIs in the array
4. **Clear browser cache** - Old OAuth URLs might be cached
5. **Try incognito mode** - Test in a fresh browser session

### If connection fails after redirect:

1. **Check Google Cloud Console** - Verify both redirect URIs are authorized
2. **Check Render logs** - Look for authentication errors
3. **Verify credentials** - Make sure client_id and client_secret are correct

## 📝 Important Notes

- The gmail-credentials.json file is NOT pushed to GitHub (it's in .gitignore)
- You need to manually update the GMAIL_CREDENTIALS environment variable on Render
- The local file should have both redirect URIs for development and production
- The system automatically detects the environment and uses the correct URI

## 🎯 Summary

1. ✅ Code pushed to GitHub
2. ⏳ Update GMAIL_CREDENTIALS on Render (you need to do this manually)
3. ⏳ Wait for automatic redeploy
4. ⏳ Test Gmail connection

**Current Status:** Code is ready, waiting for Render environment variable update.
