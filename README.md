# 🎓 KRP Admin Dashboard

A comprehensive admin dashboard for managing student attendance, projects, and communications via Gmail integration.

## ✨ Features

- 📊 **Student Management** - Add, edit, and manage student records
- ✅ **Attendance Tracking** - Mark attendance via dashboard or email
- 📧 **Gmail Integration** - Send emails, notifications, and reminders
- 📝 **Project Management** - Assign projects and track responses
- 🔔 **Automatic Notifications** - Daily attendance reminders at 9:00 AM
- 📱 **Email Buttons** - Mark attendance directly from email
- 💾 **Data Persistence** - MongoDB integration for permanent storage
- 🎯 **Attendance Manager System** - Dedicated managers for attendance tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (Atlas or local)
- Gmail account for OAuth

### Installation

```bash
# Install dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Configuration

1. Copy `.env.example` to `.env` in server folder
2. Update environment variables
3. Set up Gmail OAuth credentials (see AGENCY_SETUP_GUIDE.md)

### Run Locally

```bash
# Start backend
cd server
node server.js

# Start frontend (in new terminal)
npm run dev
```

Visit: http://localhost:5173

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deploy to Render + Vercel
- [Agency Setup Guide](AGENCY_SETUP_GUIDE.md) - Setup for new users
- [How to Add Students](HOW_TO_ADD_STUDENTS.md)
- [How to Add Managers](HOW_TO_ADD_MANAGERS.md)
- [Quick Start](QUICK_START.md)

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components

### Backend
- Node.js
- Express
- MongoDB
- Gmail API (OAuth 2.0)
- Node-cron (scheduled tasks)

## 🔐 Security

- Environment variables for sensitive data
- Gmail OAuth 2.0 authentication
- MongoDB connection encryption
- Secure credential storage
- `.gitignore` configured for security files

## 📦 Deployment

### Recommended: Render (Backend) + Vercel (Frontend)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete instructions.

**Free Tier Available**: Both Render and Vercel offer free tiers suitable for this application.

## 🎯 Key Features Explained

### Attendance System
- Mark attendance from dashboard
- Mark attendance from email buttons
- Automatic daily reminders at 9:00 AM
- Low attendance warnings (< 80%)
- Excellent attendance congratulations (≥ 80%)
- Student receives confirmation email

### Project System
- Create projects with requirements
- Send to multiple students
- Accept/Decline via email or dashboard
- Assignment limits (5 per student)
- First-come-first-served priority
- Response tracking with timestamps

### Email Integration
- Gmail OAuth 2.0
- Professional email templates
- Broadcast messaging
- Automatic notifications
- Clickable buttons in emails

## 📊 Database Collections

- `students` - Student records
- `attendanceManagers` - Attendance managers
- `projects` - Project records
- `projectAssignments` - Project assignments tracking
- `attendance` - Attendance records
- `logs` - System activity logs
- `templates` - Email templates

## 🔄 Automatic Features

- Daily attendance check at 9:00 AM
- Automatic email notifications
- Low attendance warnings
- Excellent attendance congratulations
- Student attendance confirmations

## 🆘 Support

For issues or questions, refer to:
- [Troubleshooting Guide](DEPLOYMENT_GUIDE.md#troubleshooting)
- [Agency Setup Guide](AGENCY_SETUP_GUIDE.md)

## 📝 License

Private - All Rights Reserved

## 👨‍💻 Developer

Developed for KRP Academy

---

**Version**: 1.0.0  
**Last Updated**: February 12, 2026  
**Status**: Production Ready ✅
