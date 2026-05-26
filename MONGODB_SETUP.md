# 🗄️ MongoDB Setup Guide

## Problem
Data refresh pe chala jata hai kyunki MongoDB connected nahi hai. Abhi fallback (in-memory) mode use ho raha hai.

## Solution: MongoDB Install Karo

### Option 1: MongoDB Community Edition (Recommended)

#### Step 1: Download MongoDB
1. Visit: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (latest)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

#### Step 2: Install MongoDB
1. Run downloaded .msi file
2. Choose "Complete" installation
3. Install as Windows Service: ✅ Yes
4. Install MongoDB Compass: ✅ Yes (GUI tool)
5. Click "Install"

#### Step 3: Verify Installation
Open PowerShell and run:
```powershell
mongod --version
```
Should show version number.

#### Step 4: Start MongoDB Service
```powershell
# Start service
net start MongoDB

# Check status
sc query MongoDB
```

### Option 2: MongoDB Atlas (Cloud - Free)

#### Step 1: Create Account
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free tier available)
3. Create a cluster (free M0 tier)

#### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your password

#### Step 3: Update .env File
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/krp_academy
```

---

## After MongoDB is Running

### Update .env File
Create/Edit: `KRP Admin Dashboard Design/server/.env`

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017
DB_NAME=krp_academy

# Gmail Configuration (already set)
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=http://localhost:5000/api/gmail/callback

# Server Port
PORT=5000
```

### Restart Backend
```powershell
# Stop current server (Ctrl+C)
# Start again
cd "KRP Admin Dashboard Design/server"
npm start
```

### Verify Connection
Look for:
```
✅ Connected to MongoDB
✅ MongoDB indexes created
```

Instead of:
```
⚠️ MongoDB connection error
⚠️ Using fallback data
```

---

## Benefits After MongoDB Setup

✅ **Data Persists** - Refresh pe data nahi jayega
✅ **Server Restart** - Data safe rahega
✅ **Production Ready** - Real database
✅ **No Test Data** - Clean start
✅ **Scalable** - Unlimited data storage

---

## Current Status (Without MongoDB)

⚠️ **Fallback Mode:**
- Data in-memory (RAM)
- Lost on refresh/restart
- Test data auto-loads
- Not production ready

---

## Quick Test (After MongoDB Setup)

1. Add a student
2. Refresh page
3. ✅ Student still there!
4. Restart server
5. ✅ Student still there!

---

## Need Help?

### Check MongoDB Service
```powershell
# Windows
sc query MongoDB

# Should show: RUNNING
```

### Check MongoDB Connection
```powershell
# Connect to MongoDB
mongosh

# List databases
show dbs

# Use KRP database
use krp_academy

# List collections
show collections
```

---

**Install MongoDB to enable permanent data storage! 🗄️**
