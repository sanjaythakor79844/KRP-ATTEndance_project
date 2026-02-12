# 🚀 Agency Setup Guide - KRP Admin Dashboard

## For New Agency/Client

This guide explains how to set up the KRP Admin Dashboard with your own Gmail account.

---

## 📋 Prerequisites

1. A Gmail account for sending emails
2. Node.js installed (v18 or higher)
3. Internet connection

---

## 🔧 Installation Steps

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Gmail OAuth (One-time Setup)

You need to create your own Gmail OAuth credentials:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Name: "KRP Admin Dashboard" (or any name)
   - Click "Create"

3. **Enable Gmail API**
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "KRP Dashboard"
   - Authorized redirect URIs: `http://localhost:5000/api/gmail/callback`
   - Click "Create"

5. **Download Credentials**
   - Click the download icon (⬇️) next to your OAuth client
   - Save the file as `gmail-credentials.json`
   - Move it to: `server/config/gmail-credentials.json`

### Step 3: Start the System

```bash
# Start backend (in one terminal)
cd server
node server.js

# Start frontend (in another terminal)
npm run dev
```

### Step 4: Connect Your Gmail

1. Open dashboard: http://localhost:5173
2. Look for **"Gmail Status"** card
3. Click **"Connect Gmail"** button
4. Sign in with your Gmail account
5. Grant permissions
6. Done! ✅

---

## 📧 Using Your Own Email

### Current Setup
- System is currently connected to: `sanjaythakor47095@gmail.com`
- This is just for demonstration

### To Use Your Email
1. Click **"Disconnect"** button in Gmail Status card
2. Click **"Connect Gmail"** button
3. Login with **YOUR Gmail account**
4. Grant permissions
5. System will now use YOUR email for all communications

### Important Notes
- You can connect/disconnect anytime
- Only one Gmail account can be connected at a time
- All emails will be sent from the connected account
- Students will see emails from YOUR email address

---

## 🗄️ Database Setup (Optional but Recommended)

### Current Status
- System uses **in-memory data** (temporary)
- Data is lost when server restarts

### To Enable Data Persistence

#### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to you
   - Click "Create Cluster"

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Update .env File**
   ```
   MONGODB_URI="your_connection_string_here"
   ```

5. **Restart Server**
   - Data will now persist permanently

#### Option 2: Local MongoDB

1. Install MongoDB locally
2. Update `.env`:
   ```
   MONGODB_URI="mongodb://localhost:27017"
   ```
3. Restart server

---

## 👥 Student Data

### Current Students (Batch A)
The system comes with 15 pre-loaded students:
- Dakshi Kocharekar
- Bhavna
- Shafaq
- Sarah
- Vaibhavi
- Rishakha
- Simran
- Harshi
- Sangeeta
- Vrindanti
- Mayra
- Kanishka
- Prachika
- Aviva
- Khushi

### To Add Your Students
1. Go to **"Students"** page
2. Click **"Add Student"** button
3. Fill in details
4. Click "Save"

### To Remove Demo Students
1. Go to **"Students"** page
2. Click delete icon (🗑️) next to each student
3. Or edit `server/services/mongoService.js` and remove from `fallbackData.students`

---

## 🎯 Features Overview

### Attendance System
- Mark attendance from dashboard
- Mark attendance from email (clickable buttons)
- Send reminders to attendance managers
- Automatic daily checks at 9:00 AM
- Low attendance warnings (< 80%)
- Excellent attendance congratulations (≥ 80%)

### Project System
- Create projects with requirements
- Send to multiple students
- Accept/Decline via email or dashboard
- Assignment limits (5 per student)
- First-come-first-served priority
- Response tracking

### Broadcast System
- Send emails to all students
- Custom templates
- Professional email design

### Email Templates
- Attendance reminders
- Project assignments
- Low attendance warnings
- Congratulations messages
- Custom templates

---

## 🔒 Security Notes

### Gmail Credentials
- Keep `gmail-credentials.json` secure
- Never commit to Git
- Already in `.gitignore`

### Environment Variables
- Keep `.env` file secure
- Update passwords for production
- Use strong JWT secret

---

## 🆘 Troubleshooting

### Gmail Not Connecting
1. Check if `gmail-credentials.json` exists in `server/config/`
2. Verify OAuth redirect URI: `http://localhost:5000/api/gmail/callback`
3. Make sure Gmail API is enabled in Google Cloud Console
4. Try disconnecting and reconnecting

### Data Not Persisting
1. Check if MongoDB is connected (see server logs)
2. Verify `MONGODB_URI` in `.env` file
3. Test MongoDB connection separately
4. System will use fallback data if MongoDB fails

### Emails Not Sending
1. Check Gmail connection status
2. Verify internet connection
3. Check server logs for errors
4. Try disconnecting and reconnecting Gmail

### Port Already in Use
1. Backend (5000): Change `PORT` in `.env`
2. Frontend (5173): Change in `vite.config.js`

---

## 📞 Support

### System Information
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: MongoDB (optional)
- Email: Gmail API (OAuth 2.0)

### Files to Keep Secure
- `server/config/gmail-credentials.json`
- `server/config/gmail-token.json`
- `server/.env`

### Files to Customize
- `server/services/mongoService.js` - Student data
- `server/templates/emailTemplates.js` - Email templates
- `server/.env` - Configuration

---

## ✅ Quick Start Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Create Gmail OAuth credentials
- [ ] Place `gmail-credentials.json` in `server/config/`
- [ ] Start backend (`cd server && node server.js`)
- [ ] Start frontend (`npm run dev`)
- [ ] Connect your Gmail account
- [ ] Add your students
- [ ] Test sending emails
- [ ] (Optional) Connect MongoDB for data persistence

---

## 🎉 You're Ready!

Once you complete these steps, you can:
- ✅ Send emails from your Gmail
- ✅ Manage student attendance
- ✅ Assign projects
- ✅ Track responses
- ✅ Send automatic notifications

**Enjoy using KRP Admin Dashboard!** 🚀

