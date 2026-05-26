# 📧 Professional Email Templates - Complete Guide

## Overview

Beautiful, user-friendly email templates created for all functionalities!

### Features
✅ **Professional Design** - Modern, branded look
✅ **Responsive** - Works on all devices
✅ **Color-Coded** - Different colors for different purposes
✅ **User-Friendly** - Clear, easy to understand
✅ **Branded** - KRP Academy branding throughout

---

## Available Templates

### 1. Project Assignment Email
**Color:** Blue (Primary)
**Icon:** 📊
**Purpose:** When project is assigned to student

**Includes:**
- Project title and description
- Deadline and location
- Next steps checklist
- "View Project Details" button

### 2. Attendance Warning Email
**Color:** Red (Danger)
**Icon:** ⚠️
**Purpose:** When attendance < 80%

**Includes:**
- Large percentage display (red)
- Attendance breakdown table
- Action required section
- "View Full Report" button

### 3. Attendance Congratulations Email
**Color:** Green (Success)
**Icon:** 🎉
**Purpose:** When attendance ≥ 80%

**Includes:**
- Large percentage display (green)
- Attendance breakdown table
- Encouragement message
- "View Full Report" button

### 4. Attendance Manager Reminder
**Color:** Yellow (Warning)
**Icon:** 📅
**Purpose:** Daily reminder to mark attendance

**Includes:**
- Today's date
- Steps to mark attendance
- List of students to mark
- "Open Dashboard" button

### 5. Project Response Confirmation
**Color:** Varies (Accept=Green, Decline=Red, Skip=Yellow)
**Icon:** ✅/❌/⏭️
**Purpose:** Confirm student's project response

**Includes:**
- Response confirmation
- Project title
- Next steps (if accepted)
- "View Dashboard" button

### 6. Broadcast Message
**Color:** Blue (Primary)
**Icon:** 📢
**Purpose:** Custom messages to students

**Includes:**
- Custom subject
- Custom message
- "Open Dashboard" button

---

## Template Structure

### Common Elements

#### Header
- KRP Academy logo/title
- Gradient background
- Template-specific title
- Color-coded by purpose

#### Body
- Personalized greeting
- Main content
- Information cards
- Action buttons

#### Footer
- Automated message notice
- Copyright information
- Professional branding

---

## Color Scheme

```
Primary (Blue):   #3b82f6 - Projects, Broadcast
Success (Green):  #10b981 - Congratulations, Accept
Warning (Yellow): #f59e0b - Reminders, Skip
Danger (Red):     #ef4444 - Warnings, Decline
Dark (Gray):      #1f2937 - Text
Light (Gray):     #f3f4f6 - Backgrounds
```

---

## How to Use Templates

### In gmailService.js

```javascript
import emailTemplates from '../templates/emailTemplates.js';

// Project Assignment
const html = emailTemplates.projectAssignment({
  studentName: 'Sanjay',
  projectTitle: 'E-Commerce Website',
  description: 'Build a full-stack platform',
  deadline: '2026-02-15',
  location: 'Computer Lab A',
  dashboardUrl: 'http://localhost:5173'
});

// Attendance Warning
const html = emailTemplates.attendanceWarning({
  studentName: 'Sanjay',
  percentage: 50,
  totalDays: 10,
  presentDays: 5,
  absentDays: 5,
  lateDays: 0,
  dashboardUrl: 'http://localhost:5173'
});

// Attendance Congratulations
const html = emailTemplates.attendanceCongratulations({
  studentName: 'Shyanjali',
  percentage: 100,
  totalDays: 10,
  presentDays: 9,
  absentDays: 0,
  lateDays: 1,
  dashboardUrl: 'http://localhost:5173'
});

// Manager Reminder
const html = emailTemplates.attendanceManagerReminder({
  managerName: 'Sanjay',
  date: 'Monday, February 7, 2026',
  students: [
    { name: 'Student 1', email: 'email1@example.com' },
    { name: 'Student 2', email: 'email2@example.com' }
  ],
  dashboardUrl: 'http://localhost:5173'
});

// Project Response
const html = emailTemplates.projectResponse({
  studentName: 'Sanjay',
  projectTitle: 'E-Commerce Website',
  response: 'accept', // or 'decline' or 'skip'
  dashboardUrl: 'http://localhost:5173'
});

// Broadcast
const html = emailTemplates.broadcastMessage({
  subject: 'Important Announcement',
  message: 'This is a test message.\nMultiple lines supported.',
  dashboardUrl: 'http://localhost:5173'
});
```

---

## Template Features

### Responsive Design
- Works on desktop, tablet, mobile
- Optimized for all email clients
- Gmail, Outlook, Apple Mail compatible

### Professional Look
- Modern gradient headers
- Clean typography
- Proper spacing and padding
- Rounded corners
- Subtle shadows

### User-Friendly
- Clear headings
- Easy-to-read text
- Prominent action buttons
- Color-coded information
- Icons for visual appeal

### Branded
- KRP Academy branding
- Consistent color scheme
- Professional footer
- Copyright notice

---

## Email Client Compatibility

✅ **Gmail** - Full support
✅ **Outlook** - Full support
✅ **Apple Mail** - Full support
✅ **Yahoo Mail** - Full support
✅ **Mobile Apps** - Responsive design

---

## Customization

### Change Colors
Edit `brandColors` in `emailTemplates.js`:
```javascript
const brandColors = {
  primary: '#3b82f6',   // Your primary color
  success: '#10b981',   // Success color
  warning: '#f59e0b',   // Warning color
  danger: '#ef4444',    // Danger color
  dark: '#1f2937',      // Text color
  light: '#f3f4f6'      // Background color
};
```

### Change Dashboard URL
Pass custom URL in template data:
```javascript
dashboardUrl: 'https://your-domain.com'
```

### Add Custom Content
Templates support HTML in message fields:
```javascript
message: '<strong>Bold text</strong><br>New line'
```

---

## Examples

### Project Assignment
![Project Email](Blue header, project details, deadline, action button)

### Attendance Warning
![Warning Email](Red header, large percentage, breakdown table, action items)

### Attendance Congratulations
![Success Email](Green header, large percentage, encouragement, celebration)

### Manager Reminder
![Reminder Email](Yellow header, date, student list, steps)

### Project Response
![Response Email](Color-coded header, confirmation, next steps)

### Broadcast
![Broadcast Email](Blue header, custom message, action button)

---

## Benefits

✅ **Professional** - Impress students and staff
✅ **Consistent** - Same look across all emails
✅ **Branded** - KRP Academy identity
✅ **Clear** - Easy to understand
✅ **Actionable** - Clear next steps
✅ **Responsive** - Works everywhere
✅ **Maintainable** - Easy to update

---

**All templates are ready to use! 🎉**

**Location:** `server/templates/emailTemplates.js`
