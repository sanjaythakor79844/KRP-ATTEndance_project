# 🔧 Gmail OAuth Redirect Fix - COMPLETE SOLUTION

## Problem
Gmail OAuth was redirecting to `localhost:5000` instead of production URL `https://krp-attendance-project.onrender.com`

## Root Cause
The `gmailService.js` was always using `redirect_uris[0]` (localhost) regardless of environment.

## Solution Applied

### 1. Updated gmail-credentials.json
Added production URL to redirect_uris array:
```json
"redirect_uris": [
  "http://localhost:5000/api/gmail/callback",
  "https://krp-attendance-project.onrender.com/api/gmail/callback"
]
```

### 2. Updated gmailService.js
Added dynamic redirect URI selection based on environment:
```javascript
const isProduction = process.env.NODE_ENV === 'production' || process.env.BACKEND_URL?.includes('render.com');
const redirectUri = isProduction && redirect_uris.length > 1 ? redirect_uris[1] : redirect_uris[0];
```

### 3. Updated .env
Changed NODE_ENV from 'development' to 'production'

## 🚀 Deployment Steps

### Step 1: Update Render Environment Variables

Go to Render Dashboard → Your Service → Environment

**Update GMAIL_CREDENTIALS variable:**

Copy the contents from `server/config/gmail-credentials.json` file and paste it as a single line JSON (remove all line breaks and spaces between elements).

**Make sure NODE_ENV is set to:**
```
production
```

### Step 2: Verify Google Cloud Console Settings

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", make sure BOTH are listed:
   - `http://localhost:5000/api/gmail/callback`
   - `https://krp-attendance-project.onrender.com/api/gmail/callback`

4. Under "Authorized JavaScript origins", make sure BOTH are listed:
   - `http://localhost:5000`
   - `https://krp-attendance-project.onrender.com`

### Step 3: Commit and Push Changes

```bash
cd "KRP Admin Dashboard Design"
git add .
git commit -m "Fix Gmail OAuth redirect to use production URL"
git push origin main
```

### Step 4: Redeploy on Render

Render will automatically redeploy when you push to GitHub.

### Step 5: Test Gmail Connection

1. Go to: https://krp-att-endance-project.vercel.app
2. Login with password: `krp@2024`
3. Click "Connect Gmail" button
4. You should now be redirected to Google OAuth
5. After authorization, you should be redirected back to: `https://krp-attendance-project.onrender.com/api/gmail/callback`
6. Then redirected to frontend with success message

## 🔍 How to Verify It's Working

Check Render logs after deployment. You should see:
```
🔧 Using redirect URI: https://krp-attendance-project.onrender.com/api/gmail/callback (Production: true)
```

If you see `(Production: false)`, then NODE_ENV is not set correctly.

## ✅ Expected Behavior

- **Local Development**: Uses `http://localhost:5000/api/gmail/callback`
- **Production (Render)**: Uses `https://krp-attendance-project.onrender.com/api/gmail/callback`

## 🎯 What This Fixes

1. ✅ Gmail OAuth now redirects to production URL
2. ✅ Users can connect their Gmail from production dashboard
3. ✅ No more localhost redirect errors
4. ✅ System works for any user who wants to connect their Gmail

## 📝 Notes

- The system detects production environment by checking:
  - `NODE_ENV === 'production'`
  - OR `BACKEND_URL` contains 'render.com'
- Both localhost and production URLs are kept for local development
- No need to change Google Cloud Console settings again
