# 🚀 Render Deployment - Exact Values to Fill

## Step-by-Step Render Configuration

---

## 1️⃣ Instance Type Selection

**Select:** `Free` (0.1 CPU, 512 MB RAM)
- Perfect for your project
- $0/month
- Suitable for hobby projects

---

## 2️⃣ Environment Variables

Yeh values **Environment Variables** section mein add karni hain:

### Variable 1: PORT
```
NAME: PORT
VALUE: 5000
```

### Variable 2: MONGODB_URI
```
NAME: MONGODB_URI
VALUE: mongodb+srv://220390107031_db_user:ABC123@cluster0.xzdo9u2.mongodb.net/krp_academy_db?retryWrites=true&w=majority&appName=Cluster0
```

### Variable 3: JWT_SECRET
```
NAME: JWT_SECRET
VALUE: krp_academy_jwt_secret_2024_secure_key
```

### Variable 4: NODE_ENV
```
NAME: NODE_ENV
VALUE: production
```

### Variable 5: WEEKLY_PROJECT_LIMIT
```
NAME: WEEKLY_PROJECT_LIMIT
VALUE: 3
```

### Variable 6: ATTENDANCE_THRESHOLD
```
NAME: ATTENDANCE_THRESHOLD
VALUE: 80
```

---

## 3️⃣ Basic Settings

### Name
```
krp-attendance-backend
```
(Ya koi bhi naam jo aapko pasand ho)

### Region
```
Singapore (Southeast Asia)
```
(Ya nearest region select karein)

### Branch
```
main
```

### Root Directory
```
KRP Admin Dashboard Design/server
```
⚠️ **IMPORTANT:** Backend code `server` folder mein hai

### Build Command
```
npm install
```

### Start Command
```
node server.js
```

---

## 4️⃣ Advanced Settings (Optional)

### Auto-Deploy
```
✅ Yes (Enable)
```
Jab bhi GitHub par push karoge, automatically deploy hoga

### Health Check Path
```
/api/health
```
(Optional - agar health check endpoint hai)

---

## 📋 Complete Form Fill Guide

### Section 1: Instance Type
- Click on: **Free** ($0/month)

### Section 2: Environment Variables
Click **"Add Environment Variable"** button 6 times aur yeh fill karein:

| Name | Value |
|------|-------|
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://220390107031_db_user:ABC123@cluster0.xzdo9u2.mongodb.net/krp_academy_db?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `krp_academy_jwt_secret_2024_secure_key` |
| `NODE_ENV` | `production` |
| `WEEKLY_PROJECT_LIMIT` | `3` |
| `ATTENDANCE_THRESHOLD` | `80` |

### Section 3: Advanced (Click to expand)
- **Auto-Deploy:** Yes
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

---

## 🎯 Quick Copy-Paste Values

### For MongoDB URI:
```
mongodb+srv://220390107031_db_user:ABC123@cluster0.xzdo9u2.mongodb.net/krp_academy_db?retryWrites=true&w=majority&appName=Cluster0
```

### For JWT Secret:
```
krp_academy_jwt_secret_2024_secure_key
```

---

## ⚠️ Important Notes:

1. **Root Directory:** 
   - Render ko batana padega ki backend code `server` folder mein hai
   - Root Directory: `KRP Admin Dashboard Design/server`

2. **Environment Variables:**
   - Sab variables carefully copy-paste karein
   - Koi space ya typo nahi hona chahiye

3. **MongoDB Connection:**
   - Aapka MongoDB Atlas already setup hai
   - Connection string working hai
   - Koi change nahi karna

4. **Gmail OAuth:**
   - Gmail credentials Render par upload nahi kar sakte
   - Deployment ke baad manually setup karna hoga
   - Ya local se hi Gmail features use karein

---

## 🔄 After Deployment:

### Step 1: Get Your Backend URL
Render deployment complete hone ke baad aapko URL milega:
```
https://krp-attendance-backend.onrender.com
```

### Step 2: Update Frontend Config
Frontend mein `src/config.ts` file mein yeh URL add karein:
```typescript
export const API_URL = 'https://krp-attendance-backend.onrender.com';
```

### Step 3: Test Backend
Browser mein open karein:
```
https://krp-attendance-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 🎨 Screenshot Reference:

Aapne jo screenshot share kiya, usme:

1. **Instance Type:** Free select karein (top left)
2. **Environment Variables:** 
   - Left box: Variable name (e.g., `PORT`)
   - Right box: Variable value (e.g., `5000`)
   - Click "Add Environment Variable" for each new variable
3. **Advanced:** Click to expand aur build/start commands add karein

---

## ✅ Deployment Checklist:

- [ ] GitHub repository connected
- [ ] Branch selected: `main`
- [ ] Root directory: `KRP Admin Dashboard Design/server`
- [ ] Instance type: Free
- [ ] All 6 environment variables added
- [ ] Build command: `npm install`
- [ ] Start command: `node server.js`
- [ ] Auto-deploy enabled
- [ ] Click "Deploy Web Service"

---

## 🆘 Troubleshooting:

### If deployment fails:

1. **Check Logs:**
   - Render dashboard → Your service → Logs
   - Dekho kya error aa raha hai

2. **Common Issues:**
   - Root directory wrong: Should be `KRP Admin Dashboard Design/server`
   - Environment variables missing: Check all 6 are added
   - MongoDB connection: Verify connection string is correct

3. **Build Fails:**
   - Check `package.json` exists in server folder
   - Verify all dependencies are listed

---

## 📞 Need Help?

Agar koi problem aaye deployment mein, mujhe batao:
- Error message
- Deployment logs
- Screenshot of settings

Main help karunga! 🚀
