# 🚀 Quick Start Guide - KRP Admin Dashboard

## ⚡ Start the System

```bash
cd "KRP Admin Dashboard Design"
start.bat
```

This will start both frontend (port 5173) and backend (port 5000).

---

## 🌐 Access the Dashboard

Open your browser and go to: **http://localhost:5173**

---

## 📋 Main Features

### 1. **Dashboard Tab** 📊
- Overview of system status
- Quick stats
- Recent activity

### 2. **Students Tab** 👥
- View all students
- Add new students
- Edit student details
- Delete students

### 3. **Attendance Tab** ✅
- **Mark Today's Attendance**
  - Click Present/Absent/Late for each student
  - See today's summary at top
  
- **Send Manager Reminder**
  - Purple card at top
  - Select manager from dropdown
  - Click "Send Reminder"
  - Manager gets professional email
  
- **Send Notifications**
  - Click "Send Notifications" button
  - Students < 80% get warning email (Red)
  - Students ≥ 80% get congratulations email (Green)
  
- **View Attendance Summary**
  - See all students' attendance records
  - Percentage, present/absent/late counts
  - Performance indicators

### 4. **Projects Tab** 📊
- **Create Project**
  - Click "Add Project"
  - Fill in title, description, date, location
  - Click "Add Project"
  
- **Send Project**
  - Select students from dropdown
  - Click "Send to Students"
  - Students receive professional assignment email (Blue)
  
- **Edit/Delete Projects**
  - Click Edit or Delete buttons
  - Projects sync with dropdown immediately

### 5. **Broadcast Tab** 📢
- **Quick Templates**
  - Purple card at top with 3 templates
  - Click template to auto-fill
  
- **Send Broadcast**
  - Write subject and message
  - Select students
  - Click "Send Broadcast"
  - Students receive professional email (Blue)

### 6. **Templates Tab** 📝
- View all message templates
- Add new templates
- Edit existing templates

### 7. **Logs Tab** 📋
- View all system activities
- See timestamps
- Track email deliveries

---

## 📧 Email Templates

All emails use professional branded templates:

1. **Attendance Warning** (< 80%) - Red theme
2. **Attendance Congratulations** (≥ 80%) - Green theme
3. **Attendance Manager Reminder** - Yellow theme
4. **Project Assignment** - Blue theme
5. **Project Response Confirmation** - Color-coded
6. **Broadcast Message** - Blue theme

---

## 🧪 Quick Test

### Test Attendance Notifications:
1. Go to **Attendance** tab
2. Mark some students present, some absent
3. Click **"Send Notifications"**
4. Check emails

### Test Manager Reminder:
1. Go to **Attendance** tab
2. Select manager from dropdown (purple card)
3. Click **"Send Reminder"**
4. Check manager's email

### Test Project Assignment:
1. Go to **Projects** tab
2. Create a project
3. Select students and click **"Send to Students"**
4. Check student emails

### Test Broadcast:
1. Go to **Broadcast** tab
2. Click a template or write custom message
3. Select students and click **"Send Broadcast"**
4. Check student emails

---

## ⏰ Automatic Features

### Daily Reminders (9:00 AM)
- System automatically checks all students
- Students with < 80% attendance receive warning emails
- No manual action needed

### Manual Trigger (for testing)
```bash
curl -X POST http://localhost:5000/api/attendance/trigger-automatic
```

---

## 🔧 Troubleshooting

### Frontend not loading?
```bash
cd "KRP Admin Dashboard Design"
npm run dev
```

### Backend not responding?
```bash
cd "KRP Admin Dashboard Design/server"
node server.js
```

### Gmail not connected?
1. Check `server/config/gmail-token.json` exists
2. Restart backend server
3. Check server logs

### Data lost after restart?
- MongoDB not connected (using in-memory storage)
- Data will be lost on restart
- See `MONGODB_SETUP.md` for persistence

---

## 📞 Current Setup

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Gmail**: sanjaythakor47095@gmail.com
- **Students**: 2 (Sanjay & Shyanjali)
- **Templates**: 6 professional templates
- **Scheduler**: Active (9:00 AM daily)

---

## 📚 More Documentation

- `SYSTEM_STATUS.md` - Complete system overview
- `TEMPLATES_INTEGRATED.md` - Email templates guide
- `EMAIL_TEMPLATES_GUIDE.md` - Template usage
- `ATTENDANCE_REMINDER_GUIDE.md` - Attendance features
- `MONGODB_SETUP.md` - Database setup

---

## ✅ System Status

🟢 **ALL SYSTEMS OPERATIONAL**

- ✅ Frontend running
- ✅ Backend running
- ✅ Gmail connected
- ✅ Templates integrated
- ✅ Scheduler active
- ✅ Ready for use

---

**Last Updated**: February 7, 2026  
**Version**: 1.0.0
