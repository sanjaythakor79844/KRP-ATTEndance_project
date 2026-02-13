# 🚀 Update GMAIL_CREDENTIALS on Render

## The gmail-credentials.json file is hidden/not clickable

Don't worry! I'll show you the exact value you need.

## 📋 EXACT STEPS

### Step 1: Get the Credentials Value

Open your file explorer and navigate to:
```
KRP Admin Dashboard Design\server\config\
```

You should see a file called `gmail-credentials.json`

If you can't see it, try:
1. Open VS Code
2. Open the folder: `KRP Admin Dashboard Design`
3. Navigate to: `server/config/gmail-credentials.json`
4. Copy the entire content

### Step 2: Format as Single Line

The file looks like this:
```json
{
  "web": {
    "client_id": "...",
    "client_secret": "...",
    "redirect_uris": [
      "http://localhost:5000/api/gmail/callback",
      "https://krp-attendance-project.onrender.com/api/gmail/callback"
    ]
  }
}
```

You need to make it ONE LINE (remove all line breaks and extra spaces):
```
{"web":{"client_id":"...","client_secret":"...","redirect_uris":["http://localhost:5000/api/gmail/callback","https://krp-attendance-project.onrender.com/api/gmail/callback"]}}
```

### Step 3: Update on Render

1. Go to: https://dashboard.render.com
2. Click: **krp-attendance-project**
3. Click: **Environment** (left sidebar)
4. Find: **GMAIL_CREDENTIALS**
5. Click: **Edit** (pencil icon)
6. Delete the old value
7. Paste the new value (single line JSON)
8. Click: **Save Changes**

### Step 4: Wait for Redeploy

Render will automatically redeploy (2-3 minutes).

### Step 5: Test

1. Go to: https://krp-att-endance-project.vercel.app
2. Login: `krp@2024`
3. Click: **Connect Gmail**
4. Should work now! ✅

---

## 🆘 Alternative Method - Use Command Line

If you still can't find the file, run this command:

```bash
cd "KRP Admin Dashboard Design"
type server\config\gmail-credentials.json
```

This will show you the file content. Then copy it and format as single line.

---

## ✅ What Should Happen

After updating and redeploying:

**In Render Logs:**
```
🔧 Using redirect URI: https://krp-attendance-project.onrender.com/api/gmail/callback (Production: true)
```

**In Browser:**
- Click "Connect Gmail" → Opens Google OAuth
- After login → Redirects to production URL (NOT localhost)
- Shows "Connected" ✅

---

## 📞 If You Need Help

The file `gmail-credentials.json` is in:
- Path: `KRP Admin Dashboard Design/server/config/gmail-credentials.json`
- It's a JSON file with OAuth credentials
- You need to copy its content and paste to Render

That's it! 🎉
