# 📧 Email Testing Guide - Complete Checklist

## 🎯 Current Status

### Backend Server: ✅ Running
- Port: 5000
- Status: Active
- Gmail Service: Waiting for credentials

### Gmail Status: ⚠️ Not Connected
- Reason: Credentials file missing
- Location needed: `server/config/gmail-credentials.json`

---

## 🔧 Step 1: Gmail Setup (Required First)

### A. Create Gmail Credentials

1. **Google Cloud Console** par jayein:
   ```
   ```

2. **Login** karein: `sanjaythakor47095@gmail.com`

3. **New Project** banayein:
   - Name: "KRP Admin Dashboard"
   - Click "Create"

4. **Gmail API Enable** karein:
   - Menu > "APIs & Services" > "Library"
   - Search: "Gmail API   https://console.cloud.google.com
"
   - Click "Enable"

5. **OAuth Consent Screen** setup karein:
   - Menu > "APIs & Services" > "OAuth consent screen"
   - User Type: "External"
   - App name: "KRP Admin Dashboard"
   - User support email: sanjaythakor47095@gmail.com
   - Developer email: sanjaythakor47095@gmail.com
   - Scopes add karein:
     - `gmail.send`
     - `gmail.readonly`
     - `userinfo.email`
   - Test users add karein: sanjaythakor47095@gmail.com

6. **OAuth Credentials** create karein:
   - Menu > "APIs & Services" > "Credentials"
   - "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "KRP Admin Gmail"
   - Authorized redirect URIs:
     ```
     http://localhost:5000/api/gmail/callback
     ```
   - Click "Create"
   - **Download JSON** file

7. **File Setup**:
   - Downloaded file ka naam change karein: `gmail-credentials.json`
   - Copy karein to:
     ```
     KRP Admin Dashboard Design/server/config/gmail-credentials.json
     ```

### B. Server Restart Karein

Backend restart hoga automatically ya manually restart karein.

---

## 🧪 Step 2: Testing Checklist

### Test 1: Gmail Connection Status ✅

```bash
curl http://localhost:5000/api/gmail/status
```

**Expected Response (Before Auth):**
```json
{
  "success": true,
  "connected": false,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

**Expected Response (After Auth):**
```json
{
  "success": true,
  "connected": true,
  "user": {
    "email": "sanjaythakor47095@gmail.com",
    "name": "sanjaythakor47095"
  }
}
```

### Test 2: Get Auth URL 🔗

```bash
curl http://localhost:5000/api/gmail/auth-url
```

**Action:**
1. Response mein `authUrl` milega
2. Browser mein open karein
3. sanjaythakor47095@gmail.com se login karein
4. Permissions allow karein
5. Redirect hoga to callback URL

### Test 3: Send Test Email 📧

**After Gmail is connected:**

```bash
curl -X POST http://localhost:5000/api/gmail/send ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"sanjaythakor47095@gmail.com\",\"subject\":\"Test Email\",\"message\":\"<h1>Hello Sanjay!</h1><p>Gmail working!</p>\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "to": "sanjaythakor47095@gmail.com"
}
```

**Check:**
- ✅ Email received at sanjaythakor47095@gmail.com
- ✅ Subject: "Test Email"
- ✅ HTML content visible

### Test 4: Attendance Reminder 📅

```bash
curl -X POST http://localhost:5000/api/attendance/trigger ^
  -H "Content-Type: application/json" ^
  -d "{\"subject\":\"Test Attendance\",\"message\":\"Please mark attendance\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Attendance reminder sent to 2 students"
}
```

**Check:**
- ✅ Email received at sanjaythakor47095@gmail.com
- ✅ Subject: "🎓 Daily Attendance Reminder"
- ✅ Professional HTML template
- ✅ Instructions visible (Present/Absent/Late)

### Test 5: Broadcast Message 📢

```bash
curl -X POST http://localhost:5000/api/broadcast ^
  -H "Content-Type: application/json" ^
  -d "{\"subject\":\"Test Broadcast\",\"message\":\"<h2>Important Announcement</h2><p>This is a test broadcast message.</p>\",\"studentIds\":[\"1\",\"2\"]}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Broadcast sent to 2 students"
}
```

**Check:**
- ✅ Email received at sanjaythakor47095@gmail.com
- ✅ Subject: "Test Broadcast"
- ✅ HTML content visible
- ✅ Professional template

### Test 6: Project Assignment 📊

First, create a project:

```bash
curl -X POST http://localhost:5000/api/projects ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Test Project\",\"date\":\"2026-02-10\",\"location\":\"Lab 101\",\"description\":\"Test project description\",\"assistantsRequired\":2,\"status\":\"active\"}"
```

Then send to students:

```bash
curl -X POST http://localhost:5000/api/projects/send ^
  -H "Content-Type: application/json" ^
  -d "{\"projectId\":\"1\",\"studentIds\":[\"1\"]}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Project sent to 1 students"
}
```

**Check:**
- ✅ Email received at sanjaythakor47095@gmail.com
- ✅ Subject: "📢 New Project Assignment: Test Project"
- ✅ Project details visible
- ✅ Accept/Decline/Skip options visible

---

## 📊 Complete Testing Matrix

| Feature | Endpoint | Method | Status | Email Received |
|---------|----------|--------|--------|----------------|
| Gmail Status | `/api/gmail/status` | GET | ⏳ Pending | N/A |
| Auth URL | `/api/gmail/auth-url` | GET | ⏳ Pending | N/A |
| Test Email | `/api/gmail/send` | POST | ⏳ Pending | ⏳ |
| Attendance | `/api/attendance/trigger` | POST | ⏳ Pending | ⏳ |
| Broadcast | `/api/broadcast` | POST | ⏳ Pending | ⏳ |
| Project | `/api/projects/send` | POST | ⏳ Pending | ⏳ |

---

## 🎯 Quick Test Script

Save this as `test-emails.bat`:

```batch
@echo off
echo Testing Gmail Integration...
echo.

echo 1. Checking Gmail Status...
curl http://localhost:5000/api/gmail/status
echo.
echo.

echo 2. Sending Test Email...
curl -X POST http://localhost:5000/api/gmail/send -H "Content-Type: application/json" -d "{\"email\":\"sanjaythakor47095@gmail.com\",\"subject\":\"Test\",\"message\":\"<h1>Working!</h1>\"}"
echo.
echo.

echo 3. Sending Attendance Reminder...
curl -X POST http://localhost:5000/api/attendance/trigger -H "Content-Type: application/json" -d "{}"
echo.
echo.

echo 4. Sending Broadcast...
curl -X POST http://localhost:5000/api/broadcast -H "Content-Type: application/json" -d "{\"subject\":\"Test\",\"message\":\"Test message\",\"studentIds\":[\"1\"]}"
echo.
echo.

echo Testing Complete!
echo Check your email: sanjaythakor47095@gmail.com
pause
```

---

## ✅ Success Indicators

### Backend Logs Should Show:
```
✅ Gmail connected: sanjaythakor47095@gmail.com
📧 Email sent to: sanjaythakor47095@gmail.com
✅ Attendance reminder sent to 2 students
✅ Broadcast sent to 2 students
✅ Project sent to 1 students
```

### Your Email Should Receive:
1. ✅ Test email with "Hello Sanjay!"
2. ✅ Attendance reminder with HTML template
3. ✅ Broadcast message
4. ✅ Project assignment (if tested)

### Gmail Inbox Check:
- Subject lines correct
- HTML formatting visible
- No errors in content
- Professional appearance

---

## 🐛 Troubleshooting

### "Gmail not authenticated"
→ Complete OAuth flow first
→ Visit auth URL in browser
→ Login and allow permissions

### "Credentials file not found"
→ Check file exists: `server/config/gmail-credentials.json`
→ Verify file name is exact
→ Restart server after adding file

### "Email not received"
→ Check spam folder
→ Verify Gmail is connected
→ Check server logs for errors
→ Verify student email is correct

### "Access blocked"
→ Add test user in Google Cloud Console
→ Verify Gmail API is enabled
→ Check OAuth consent screen settings

---

## 📝 Current Test Students

```javascript
// Student 1
{
  id: '1',
  name: 'Sanjay Thakor',
  email: 'sanjaythakor47095@gmail.com',
  phone: '7984460572',
  status: 'active'
}

// Student 2
{
  id: '2',
  name: 'Test Student',
  email: 'sanjaythakor47095@gmail.com',
  phone: '9310053241',
  status: 'active'
}
```

Both will receive emails at: **sanjaythakor47095@gmail.com**

---

## 🎉 Next Steps

1. ✅ Complete Gmail setup (Step 1)
2. ✅ Restart backend server
3. ✅ Get auth URL and authenticate
4. ✅ Run all tests (Step 2)
5. ✅ Check email inbox
6. ✅ Verify all emails received

---

**Backend is running! Complete Gmail setup to start testing emails.** 🚀

**Server:** http://localhost:5000
**Your Email:** sanjaythakor47095@gmail.com
