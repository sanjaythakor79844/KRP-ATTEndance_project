# 🚀 Complete Deployment Guide - Render + Vercel

## Prerequisites
- GitHub account
- Render account (free): https://render.com
- Vercel account (free): https://vercel.com

---

## Part 1: Prepare Code for Deployment

### ✅ Already Done:
- [x] MongoDB connection fixed
- [x] Environment variables configured
- [x] API config file created
- [x] All features working

### Files Created:
- `src/config.ts` - API configuration
- `server/.env` - Environment variables (don't commit this!)
- `.gitignore` - Security files excluded

---

## Part 2: Deploy Backend to Render

### Step 1: Create GitHub Repository (if not already)

1. Go to: https://github.com/new
2. Create new repository: `krp-admin-dashboard`
3. Make it Private (recommended)
4. Don't initialize with README

### Step 2: Push Code to GitHub

```bash
cd "KRP Admin Dashboard Design"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - KRP Admin Dashboard"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/krp-admin-dashboard.git

# Push
git push -u origin main
```

### Step 3: Deploy on Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect GitHub**
   - Click "Connect GitHub"
   - Select your repository: `krp-admin-dashboard`
   - Click "Connect"

3. **Configure Service**
   ```
   Name: krp-admin-backend
   Region: Singapore
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   Instance Type: Free
   ```

4. **Add Environment Variables**
   
   Click "Advanced" → "Add Environment Variable"
   
   Add these one by one:
   ```
   MONGODB_URI=your_mongodb_connection_string_here
   
   PORT=5000
   
   JWT_SECRET=krp_admin_secret_key_2026
   
   NODE_ENV=production
   
   ATTENDANCE_THRESHOLD=80
   
   WEEKLY_PROJECT_LIMIT=3
   ```

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - You'll get URL like: `https://krp-admin-backend.onrender.com`
   - **SAVE THIS URL!** You'll need it for frontend

6. **Test Backend**
   - Visit: `https://krp-admin-backend.onrender.com/api/health`
   - Should see: `{"status":"ok"}`

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Update Frontend Configuration

The backend URL needs to be updated. We'll do this via environment variable.

### Step 2: Deploy on Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Click "Add New" → "Project"

2. **Import GitHub Repository**
   - Click "Import Git Repository"
   - Select: `krp-admin-dashboard`
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variable**
   
   Click "Environment Variables"
   
   Add:
   ```
   Name: VITE_API_URL
   Value: https://krp-admin-backend.onrender.com
   ```
   
   (Replace with YOUR Render backend URL from Part 2, Step 5)

5. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - You'll get URL like: `https://krp-admin.vercel.app`
   - **SAVE THIS URL!** This is your dashboard

6. **Test Frontend**
   - Visit your Vercel URL
   - Dashboard should load
   - Try connecting Gmail

---

## Part 4: Update Gmail OAuth

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com
2. Select your project (the one with Gmail API)
3. Go to: APIs & Services → Credentials

### Step 2: Update OAuth Client

1. Click on your OAuth 2.0 Client ID
2. Under "Authorized redirect URIs", add:
   ```
   https://krp-admin-backend.onrender.com/api/gmail/callback
   ```
3. Keep the localhost one for testing:
   ```
   http://localhost:5000/api/gmail/callback
   ```
4. Click "Save"

---

## Part 5: Final Testing

### Test Checklist:

1. **Visit Dashboard**
   - Go to your Vercel URL
   - Dashboard should load ✅

2. **Connect Gmail**
   - Click "Connect Gmail" button
   - Login with your Gmail
   - Should redirect back successfully ✅

3. **Test Features**
   - Add a student ✅
   - Mark attendance ✅
   - Send broadcast email ✅
   - Create project ✅

4. **Check Data Persistence**
   - Add some data
   - Refresh page
   - Data should still be there ✅

---

## 🎉 Deployment Complete!

### Your URLs:
- **Dashboard**: `https://krp-admin.vercel.app` (or your custom URL)
- **Backend API**: `https://krp-admin-backend.onrender.com`
- **Database**: MongoDB Atlas (already configured)

### Share with Agency:
- Dashboard URL
- Login instructions (if any)
- Documentation files
- Support contact

---

## 🔧 Troubleshooting

### Backend Issues:

**Problem**: Backend not starting
- Check Render logs
- Verify environment variables
- Check MongoDB connection

**Problem**: API calls failing
- Check CORS settings
- Verify backend URL in frontend
- Check Render service status

### Frontend Issues:

**Problem**: Can't connect to backend
- Verify `VITE_API_URL` is correct
- Check browser console for errors
- Verify backend is running

**Problem**: Gmail OAuth not working
- Check redirect URI in Google Console
- Verify it matches your Render backend URL
- Check gmail-credentials.json is uploaded

---

## 📊 Monitoring

### Render Dashboard:
- View logs: https://dashboard.render.com
- Check service status
- Monitor usage

### Vercel Dashboard:
- View deployments: https://vercel.com/dashboard
- Check analytics
- Monitor performance

---

## 🔄 Updates & Redeployment

### To Update Code:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update: description"
   git push
   ```
3. Render and Vercel will auto-deploy! ✅

---

## 💰 Cost Breakdown

### Current Setup (FREE):
- Render: $0/month (750 hours free)
- Vercel: $0/month (unlimited)
- MongoDB Atlas: $0/month (512MB free)
- **Total: $0/month** ✅

### If You Need More:
- Render Pro: $7/month (no sleep, better performance)
- Vercel Pro: $20/month (team features)
- MongoDB: $9/month (2GB storage)

---

## 🆘 Support

### If Something Goes Wrong:

1. Check Render logs
2. Check Vercel deployment logs
3. Check browser console
4. Verify environment variables
5. Test backend API directly

### Common Issues:

**Backend sleeps after 15 min**
- This is normal on Render free tier
- First request will wake it (30-60 sec)
- Upgrade to Render Pro to avoid sleep

**CORS errors**
- Check backend CORS configuration
- Verify frontend URL is allowed

**MongoDB connection fails**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check database user permissions

---

## ✅ Final Checklist

Before sharing with agency:

- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Gmail OAuth configured
- [ ] MongoDB connected
- [ ] All features tested
- [ ] Documentation provided
- [ ] Support contact shared

---

**Deployment Date**: February 12, 2026
**Status**: Ready for Production ✅
**Deployed By**: Sanjay Thakor

