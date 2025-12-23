# KRP Telegram Bot Server with Google Sheets Integration

Complete automation system for managing students, projects, attendance, and broadcasts through Telegram with automatic data storage in Google Sheets.

## 🚀 Features

- **Telegram Bot Integration**: Automated messaging and interaction with students
- **Google Sheets Storage**: All data automatically stored in organized sheets
- **Student Management**: Register, track, and manage students
- **Assignment Distribution**: Send assignments to students via Telegram
- **Attendance Tracking**: Automated attendance triggers and tracking
- **Broadcast Messages**: Send messages to all or specific students
- **Activity Logs**: Complete audit trail of all actions
- **Scheduled Tasks**: Automated daily summaries and reports
- **REST API**: Full API for dashboard integration

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Telegram Bot Token** from [@BotFather](https://t.me/botfather)
3. **Google Cloud Project** with Sheets API enabled
4. **Google Service Account** with credentials

## 🔧 Setup Instructions

### Step 1: Create Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Save the **Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Save the **Bot Username** (e.g., `@YourBotName`)

### Step 2: Setup Google Sheets

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and create
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose JSON format and download

5. Create Google Spreadsheet:
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it "KRP Admin Dashboard Data"
   - Copy the Spreadsheet ID from URL (between `/d/` and `/edit`)
   - Share the spreadsheet with your service account email (from JSON file)
   - Give "Editor" permissions

6. Create Sheet Tabs:
   Create the following tabs in your spreadsheet:
   - `Students`
   - `Projects`
   - `Attendance`
   - `Logs`
   - `Broadcasts`
   - `Templates`

### Step 3: Install Dependencies

```bash
cd server
npm install
```

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` file with your credentials:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username

# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com

# Copy the entire private key from your JSON file (including BEGIN and END lines)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=3001
NODE_ENV=development

# Sheet Names (must match your spreadsheet tabs)
SHEET_STUDENTS=Students
SHEET_PROJECTS=Projects
SHEET_ATTENDANCE=Attendance
SHEET_LOGS=Logs
SHEET_BROADCASTS=Broadcasts
SHEET_TEMPLATES=Templates
```

### Step 5: Initialize Google Sheets Headers

Start the server and initialize the sheet headers:

```bash
npm start
```

Then make a POST request to initialize headers:
```bash
curl -X POST http://localhost:3001/api/sheets/initialize
```

Or use the dashboard to initialize sheets.

## 🎯 Usage

### Starting the Server

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

### Telegram Bot Commands

Students can use these commands:

- `/start` - Start the bot and see welcome message
- `/register` - Register as a student
- `/setname <Full Name>` - Set your name during registration
- `/mystats` - View your statistics
- `/attendance` - Mark attendance
- `/help` - Show help menu

### API Endpoints

#### Health Check
```bash
GET /api/health
```

#### Students
```bash
GET  /api/students              # Get all students
POST /api/students              # Add new student
PUT  /api/students/:index       # Update student
```

#### Projects
```bash
GET  /api/projects              # Get all projects
POST /api/projects              # Add new project
```

#### Attendance
```bash
GET  /api/attendance            # Get attendance records
POST /api/attendance            # Add attendance record
POST /api/attendance/trigger    # Send attendance trigger to students
```

#### Logs
```bash
GET  /api/logs?limit=100        # Get logs (default 100)
POST /api/logs                  # Add log entry
```

#### Broadcasts
```bash
POST /api/broadcast             # Send broadcast message
Body: {
  "message": "Your message here",
  "targetStudents": "all" | "active" | ["telegramId1", "telegramId2"]
}
```

#### Templates
```bash
GET  /api/templates             # Get all templates
POST /api/templates             # Add new template
```

#### Assignments
```bash
POST /api/assignments/send      # Send assignment to student
Body: {
  "telegramId": "123456789",
  "assignmentData": {
    "projectName": "Project Name",
    "description": "Description",
    "deadline": "2024-12-31",
    "priority": "high"
  }
}
```

#### Bot Management
```bash
GET  /api/bot/info              # Get bot information
POST /api/bot/reload-students   # Reload students from Google Sheets
```

## 📊 Google Sheets Format

### Students Sheet
| Timestamp | Name | Telegram ID | Assignment Limit | Status | Total Assignments |
|-----------|------|-------------|------------------|--------|-------------------|
| 2024-12-17 | John Doe | 123456789 | 3 | active | 5 |

### Projects Sheet
| Timestamp | Project Name | Status | Created Date | Description |
|-----------|--------------|--------|--------------|-------------|
| 2024-12-17 | Website | active | 2024-12-17 | Build website |

### Attendance Sheet
| Timestamp | Class Name | Date | Time | Manager | Status | Attended Count | Total Students |
|-----------|------------|------|------|---------|--------|----------------|----------------|
| 2024-12-17 | Math 101 | 2024-12-20 | 09:00 | John | sent | 0 | 25 |

### Logs Sheet
| Timestamp | Action | Student | Assigned Count | Status | Details | Telegram Message ID |
|-----------|--------|---------|----------------|--------|---------|---------------------|
| 2024-12-17 | Assignment Sent | John Doe | 1 | success | Project X | 12345 |

### Broadcasts Sheet
| Timestamp | Message | Sent To | Status | Success Count | Failed Count |
|-----------|---------|---------|--------|---------------|--------------|
| 2024-12-17 | Hello all | all | sent | 25 | 0 |

### Templates Sheet
| Timestamp | Template Name | Content | Category | Usage Count |
|-----------|---------------|---------|----------|-------------|
| 2024-12-17 | Welcome | Welcome message | greeting | 10 |

## 🔄 Scheduled Tasks

The server runs automated tasks:

- **Daily Summary** (6:00 PM): Sends daily activity summary to all active students
- Add more scheduled tasks in `index.js` using `node-cron`

## 🛠️ Troubleshooting

### Bot Not Responding
- Check if `TELEGRAM_BOT_TOKEN` is correct
- Ensure bot is not already running elsewhere
- Check server logs for errors

### Google Sheets Errors
- Verify service account email has access to spreadsheet
- Check if `GOOGLE_PRIVATE_KEY` is properly formatted (with `\n` for newlines)
- Ensure Google Sheets API is enabled in your project

### Connection Issues
- Check if port 3001 is available
- Verify firewall settings
- Check network connectivity

## 📝 Development

### Project Structure
```
server/
├── index.js                 # Main server file
├── package.json            # Dependencies
├── .env                    # Environment variables (create from .env.example)
├── .env.example           # Environment template
└── services/
    ├── telegramBot.js     # Telegram bot service
    └── googleSheets.js    # Google Sheets service
```

### Adding New Features

1. **New Bot Command**: Add handler in `services/telegramBot.js`
2. **New API Endpoint**: Add route in `index.js`
3. **New Sheet**: Add methods in `services/googleSheets.js`

## 🔐 Security Notes

- Never commit `.env` file to version control
- Keep your bot token and service account credentials secure
- Use environment variables for all sensitive data
- Regularly rotate API keys and tokens

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Verify all environment variables are set correctly

## 📄 License

This project is part of the KRP Admin Dashboard system.

---

**Made with ❤️ for KRP Admin Dashboard**
