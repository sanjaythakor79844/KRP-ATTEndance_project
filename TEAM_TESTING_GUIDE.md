# 🧪 Team Testing Guide - KRP Admin Dashboard

## 🚀 System is Running!

**Frontend**: http://localhost:5173  
**Backend**: http://localhost:5000  
**Gmail**: ✅ Connected as sanjaythakor47095@gmail.com

---

## 📋 Quick System Overview

### Current Students:
1. **Sanjay Thakor**
   - Email: sanjaythakor47095@gmail.com
   - Phone: 7984460572
   - Status: Active

2. **Shyanjali Datta**
   - Email: dattashyanjali81@gmail.com
   - Phone: 9310053241
   - Status: Active

### Features to Test:
1. ✅ Student Management
2. ✅ Attendance Tracking
3. ✅ Attendance Manager Reminders
4. ✅ Automatic Attendance Notifications
5. ✅ Project Management
6. ✅ Broadcast Messages
7. ✅ Professional Email Templates

---

## 🧪 Testing Checklist

### Test 1: Dashboard Overview ✅
**Steps**:
1. Open http://localhost:5173
2. Check Dashboard tab
3. Verify system status cards are showing

**Expected Result**:
- Dashboard loads successfully
- All navigation tabs visible
- System stats displayed

---

### Test 2: Student Management ✅
**Steps**:
1. Go to **Students** tab
2. View existing students (Sanjay & Shyanjali)
3. Click **"Add Student"**
4. Fill in details:
   - Name: Test Student
   - Email: test@example.com
   - Phone: 1234567890
5. Click **"Add Student"**
6. Verify student appears in list

**Expected Result**:
- Student added successfully
- Appears in student list immediately
- Can edit/delete student

---

### Test 3: Mark Attendance ✅
**Steps**:
1. Go to **Attendance** tab
2. See today's summary at top (0 marked initially)
3. For each student, click:
   - **Present** (green button)
   - **Absent** (red button)
   - **Late** (yellow button)
4. Click **"Refresh"** button
5. Check updated summary

**Expected Result**:
- Attendance marked successfully
- Today's summary updates
- Attendance summary table shows percentages

---

### Test 4: Send Attendance Manager Reminder ✅
**Steps**:
1. Stay in **Attendance** tab
2. Look for purple card at top: "Send Reminder to Attendance Manager"
3. Select manager from dropdown (Sanjay or Shyanjali)
4. Click **"Send Reminder"**
5. Check email inbox

**Expected Result**:
- Success message appears
- Manager receives professional email (Yellow theme)
- Email includes:
  - Today's date
  - Steps to mark attendance
  - List of all students
  - Dashboard link

**Check Email**: sanjaythakor47095@gmail.com or dattashyanjali81@gmail.com

---

### Test 5: Automatic Attendance Notifications ✅
**Steps**:
1. In **Attendance** tab
2. Mark attendance for students:
   - Mark Sanjay: 2 present, 3 absent (40%)
   - Mark Shyanjali: 4 present, 1 absent (80%)
3. Click **"Send Notifications"** button
4. Check both email inboxes

**Expected Result**:
- Success message with count
- **Sanjay (40%)** receives:
  - ⚠️ Warning email (Red theme)
  - Subject: "Low Attendance Alert - 40%"
  - Detailed breakdown table
  - Action required steps
  
- **Shyanjali (80%)** receives:
  - 🎉 Congratulations email (Green theme)
  - Subject: "Excellent Attendance - 80%"
  - Encouragement message
  - Keep it up section

**Check Emails**: 
- sanjaythakor47095@gmail.com (both emails)
- dattashyanjali81@gmail.com (congratulations)

---

### Test 6: Project Management ✅
**Steps**:
1. Go to **Projects** tab
2. Click **"Add Project"**
3. Fill in details:
   - Title: Test Project
   - Description: Testing project functionality
   - Date: Select future date
   - Location: Room 101
4. Click **"Add Project"**
5. Select students from dropdown
6. Click **"Send to Students"**
7. Check email

**Expected Result**:
- Project created successfully
- Appears in project list
- Students receive professional email (Blue theme)
- Email includes:
  - Project title and description
  - Deadline and location
  - Next steps
  - Dashboard link

**Check Email**: sanjaythakor47095@gmail.com

---

### Test 7: Broadcast Messages ✅
**Steps**:
1. Go to **Broadcast** tab
2. See purple card with 3 templates at top
3. Click a template (e.g., "Attendance Reminder")
4. Subject and message auto-fill
5. Or write custom message
6. Select students
7. Click **"Send Broadcast"**
8. Check email

**Expected Result**:
- Template auto-fills correctly
- Broadcast sent successfully
- Students receive professional email (Blue theme)
- Custom message displayed properly

**Check Email**: sanjaythakor47095@gmail.com

---

### Test 8: Templates Management ✅
**Steps**:
1. Go to **Templates** tab
2. View existing templates
3. Click **"Add Template"**
4. Fill in:
   - Name: Test Template
   - Content: Test message
5. Click **"Add Template"**
6. Verify template appears

**Expected Result**:
- Template added successfully
- Appears in template list
- Can be used in Broadcast tab

---

### Test 9: Activity Logs ✅
**Steps**:
1. Go to **Logs** tab
2. View all system activities
3. Check timestamps
4. Verify recent actions are logged

**Expected Result**:
- All actions logged with timestamps
- Shows:
  - Attendance marked
  - Emails sent
  - Projects created
  - Broadcasts sent

---

### Test 10: Automatic Daily Reminders ✅
**Steps**:
1. Run test script:
   ```bash
   cd "KRP Admin Dashboard Design"
   .\test-reminder-simple.bat
   ```
2. Or wait until 9:00 AM tomorrow
3. Check emails

**Expected Result**:
- Script marks test attendance
- Triggers automatic check
- Sends appropriate emails:
  - < 80% → Warning (Red)
  - ≥ 80% → Congratulations (Green)
- Shows: "2 reminders sent, 0 skipped"

**Check Emails**: Both inboxes

---

## 📧 Email Templates to Verify

### 1. Attendance Warning (< 80%) - Red Theme
- Large percentage display
- Detailed breakdown table
- Action required section
- Professional footer

### 2. Attendance Congratulations (≥ 80%) - Green Theme
- Large percentage display
- Encouragement message
- Keep it up section
- Professional footer

### 3. Attendance Manager Reminder - Yellow Theme
- Today's date
- Step-by-step instructions
- Student list
- Dashboard link

### 4. Project Assignment - Blue Theme
- Project details card
- Deadline and location
- Next steps checklist
- Dashboard link

### 5. Project Response Confirmation - Color-coded
- Accept: Green
- Decline: Red
- Skip: Yellow

### 6. Broadcast Message - Blue Theme
- Custom subject
- Custom message
- Dashboard link

---

## 🔍 Things to Check

### Visual Design:
- ✅ All emails have KRP Academy branding
- ✅ Gradient headers with proper colors
- ✅ Responsive design (check on mobile)
- ✅ Professional footer on all emails
- ✅ Action buttons styled properly

### Functionality:
- ✅ Emails delivered successfully
- ✅ Correct recipients
- ✅ Proper subject lines
- ✅ Data displays correctly
- ✅ Links work (dashboard URL)

### System Behavior:
- ✅ No errors in browser console (F12)
- ✅ No errors in server logs
- ✅ Data updates in real-time
- ✅ Buttons respond properly
- ✅ Forms validate correctly

---

## 🐛 Common Issues & Solutions

### Issue 1: Email Not Received
**Solution**: 
- Check spam/junk folder
- Verify Gmail connection in dashboard
- Check server logs for errors

### Issue 2: Data Lost After Refresh
**Reason**: Using in-memory storage (MongoDB not connected)
**Solution**: This is expected - data will be lost on restart

### Issue 3: Percentage Shows 0%
**Solution**: 
- Mark attendance first
- Click Refresh button
- Check if date/status are correct

### Issue 4: Template Not Loading
**Solution**:
- Refresh browser (Ctrl + F5)
- Clear browser cache
- Restart backend server

---

## 📊 Expected Test Results

### Successful Test Run:
```
✅ Dashboard loads
✅ Students visible (2 default)
✅ Can add new students
✅ Attendance marking works
✅ Manager reminder sent
✅ Automatic notifications sent (2 emails)
✅ Projects created and sent
✅ Broadcast messages sent
✅ Templates working
✅ Logs showing all activities
✅ All emails received with professional templates
```

### Email Count After Full Test:
- **sanjaythakor47095@gmail.com**: 5-6 emails
  - Warning email (if < 80%)
  - Congratulations email (if ≥ 80%)
  - Manager reminder
  - Project assignment
  - Broadcast message
  
- **dattashyanjali81@gmail.com**: 2-3 emails
  - Congratulations email (if ≥ 80%)
  - Project assignment (if selected)
  - Broadcast message (if selected)

---

## 🎯 Key Features to Highlight

### 1. Professional Email Templates
- All 6 templates integrated
- Branded with KRP Academy
- Color-coded by purpose
- Responsive design

### 2. Automatic Reminders
- Daily at 9:00 AM
- Checks all students
- Sends appropriate emails
- No manual action needed

### 3. Real-time Updates
- Attendance updates immediately
- Projects appear in dropdown
- Logs update in real-time

### 4. User-Friendly Interface
- Clean, modern design
- Color-coded status indicators
- Easy navigation
- Professional cards and tables

---

## 📝 Testing Notes

### Data Persistence:
- ⚠️ **Important**: Data is in-memory (not persistent)
- Will be lost on server restart
- For production, connect MongoDB

### Email Limits:
- Gmail has daily sending limits
- System includes 1-second delay between emails
- Monitor usage in Google Cloud Console

### Timezone:
- Scheduler uses Asia/Kolkata timezone
- 9:00 AM IST daily

---

## 🚀 Ready for Production?

After successful testing, system is ready for:
- ✅ Daily attendance tracking
- ✅ Automatic email notifications
- ✅ Project management
- ✅ Broadcast communications
- ✅ Professional email templates

**Next Steps**:
1. Connect MongoDB for data persistence
2. Monitor email delivery
3. Adjust thresholds if needed
4. Add more students as needed

---

## 📞 Support

**System Status**: ✅ All systems operational

**Check Logs**:
- Browser Console: F12 → Console tab
- Server Logs: Check terminal running backend
- Activity Logs: Dashboard → Logs tab

**Documentation**:
- QUICK_START.md - Quick reference
- SYSTEM_STATUS.md - Complete overview
- AUTOMATIC_EMAILS_WORKING.md - Email details
- TEMPLATES_INTEGRATED.md - Template guide

---

**Last Updated**: February 7, 2026  
**System Version**: 1.0.0  
**Status**: ✅ **Ready for Team Testing**
