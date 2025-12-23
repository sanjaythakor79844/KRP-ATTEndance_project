# 🤖 Telegram Bot Setup Guide - Quick Start

## 📝 Overview

This guide will help you set up the Telegram bot integration with Google Sheets for your KRP Admin Dashboard in **under 15 minutes**.

## ⚡ Quick Setup (3 Steps)

### Step 1: Create Your Telegram Bot (3 minutes)

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Choose a name: `KRP Admin Bot` (or any name you like)
4. Choose a username: `krp_admin_bot` (must end with 'bot')
5. **Copy and save** the bot token (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Setup Google Sheets (5 minutes)

#### A. Create Service Account
1. Go to https://console.cloud.google.com/
2. Create new project: "KRP Admin Dashboard"
3. Enable Google Sheets API:
   - Menu → APIs & Services → Library
   - Search "Google Sheets API" → Enable
4. Create Service Account:
   - Menu → APIs & Services → Credentials
   - Create Credentials → Service Account
   - Name: "krp-bot-service"
   - Create and Continue → Done
5. Create Key:
   - Click on the service account you just created
   - Keys tab → Add Key → Create New Key
   - Choose JSON → Create
   - **Save the downloaded JSON file**

#### B. Create Google Spreadsheet
1. Go to https://sheets.google.com/
2. Create new spreadsheet
3. Name it: "KRP Admin Dashboard Data"
4. Create these tabs (sheets):
   - Students
   - Projects
   - Attendance
   - Logs
   - Broadcasts
   - Templates
5. Copy the Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SPREADSHEET_ID]/edit
   ```
6. Share spreadsheet:
   - Click "Share" button
   - Add the email from your JSON file (looks like: `krp-bot-service@project-name.iam.gserviceaccount.com`)
   - Give "Editor" access
   - Done

### Step 3: Configure and Run (5 minutes)

#### A. Install Dependencies
```bash
cd "c:\Users\sanja\Downloads\Telegram automation system\KRP Admin Dashboard Design\server"
npm install
```

#### B. Setup Environment Variables
1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Open `.env` file and fill in:

```env
# From BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=krp_admin_bot

# From Google Sheets URL
GOOGLE_SHEETS_SPREADSHEET_ID=1a2b3c4d5e6f7g8h9i0j

# From downloaded JSON file
GOOGLE_SERVICE_ACCOUNT_EMAIL=krp-bot-service@project-name.iam.gserviceaccount.com

# From JSON file - copy the entire "private_key" value
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(your key here)...==\n-----END PRIVATE KEY-----\n"

# Server settings (keep as is)
PORT=3001
NODE_ENV=development

# Sheet names (keep as is)
SHEET_STUDENTS=Students
SHEET_PROJECTS=Projects
SHEET_ATTENDANCE=Attendance
SHEET_LOGS=Logs
SHEET_BROADCASTS=Broadcasts
SHEET_TEMPLATES=Templates
```

**Important for GOOGLE_PRIVATE_KEY:**
- Open your JSON file
- Find the "private_key" field
- Copy the entire value (including the quotes)
- Paste it in the .env file
- Make sure `\n` characters are preserved (they represent line breaks)

#### C. Start the Server
```bash
npm start
```

You should see:
```
✅ Server running on port 3001
✅ Telegram Bot initialized successfully
✅ Google Sheets API initialized successfully
```

#### D. Initialize Sheet Headers
Open a new terminal and run:
```bash
curl -X POST http://localhost:3001/api/sheets/initialize
```

Or open your browser and visit:
```
http://localhost:3001/api/health
```

## ✅ Testing Your Setup

### Test 1: Check Server Health
Visit: http://localhost:3001/api/health

You should see:
```json
{
  "status": "running",
  "bot": {
    "isRunning": true,
    "studentsCount": 0,
    "botUsername": "krp_admin_bot"
  }
}
```

### Test 2: Test Telegram Bot
1. Open Telegram
2. Search for your bot username (e.g., `@krp_admin_bot`)
3. Send `/start` command
4. You should receive a welcome message!

### Test 3: Register a Student
1. In Telegram, send `/register`
2. Send `/setname John Doe`
3. Check your Google Sheets - you should see a new row in the Students sheet!

### Test 4: Check Logs
Visit: http://localhost:3001/api/logs

You should see your registration activity logged!

## 🎯 Common Use Cases

### Send Assignment to Student
```bash
curl -X POST http://localhost:3001/api/assignments/send \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "assignmentData": {
      "projectName": "Website Development",
      "description": "Build a responsive website",
      "deadline": "2024-12-31",
      "priority": "high"
    }
  }'
```

### Send Broadcast Message
```bash
curl -X POST http://localhost:3001/api/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello everyone! Class starts at 9 AM tomorrow.",
    "targetStudents": "active"
  }'
```

### Trigger Attendance
```bash
curl -X POST http://localhost:3001/api/attendance/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "className": "Math 101",
    "date": "2024-12-20",
    "time": "09:00",
    "manager": "Prof. Smith"
  }'
```

## 🔧 Troubleshooting

### Bot Not Responding
**Problem:** Bot doesn't reply to messages

**Solutions:**
1. Check if server is running: `http://localhost:3001/api/health`
2. Verify bot token in `.env` file
3. Make sure no other instance is running
4. Check server logs for errors

### Google Sheets Not Updating
**Problem:** Data not appearing in sheets

**Solutions:**
1. Verify spreadsheet is shared with service account email
2. Check if sheet tab names match `.env` configuration
3. Verify `GOOGLE_PRIVATE_KEY` is correctly formatted
4. Check server logs for Google API errors

### "Cannot find module" Error
**Problem:** Server won't start

**Solution:**
```bash
cd server
npm install
```

### Port Already in Use
**Problem:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solution:**
Change port in `.env`:
```env
PORT=3002
```

## 📱 Bot Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Start bot and see welcome | `/start` |
| `/register` | Register as student | `/register` |
| `/setname` | Set your name | `/setname John Doe` |
| `/mystats` | View your statistics | `/mystats` |
| `/attendance` | Mark attendance | `/attendance` |
| `/help` | Show help menu | `/help` |

## 🔄 Integration with Dashboard

The server provides REST APIs that your dashboard can use:

```javascript
// Example: Fetch students from API
fetch('http://localhost:3001/api/students')
  .then(res => res.json())
  .then(data => console.log(data));

// Example: Send broadcast
fetch('http://localhost:3001/api/broadcast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello students!',
    targetStudents: 'active'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 📊 Data Flow

```
Dashboard → REST API → Server → Telegram Bot → Students
                    ↓
              Google Sheets (Storage)
```

1. Dashboard sends request to API
2. Server processes and sends to Telegram
3. Data is automatically saved to Google Sheets
4. Logs are created for audit trail

## 🎓 Next Steps

1. ✅ Test all bot commands
2. ✅ Verify Google Sheets is updating
3. ✅ Try sending a broadcast message
4. ✅ Test attendance marking
5. ✅ Check logs in Google Sheets
6. 🔄 Integrate with your dashboard UI
7. 📱 Share bot with your students

## 📞 Need Help?

Check the detailed documentation in `server/README.md` for:
- Complete API reference
- Advanced configuration
- Security best practices
- Development guidelines

---

**🎉 Congratulations! Your Telegram bot is now live and connected to Google Sheets!**
