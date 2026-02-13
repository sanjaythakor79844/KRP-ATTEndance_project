# 🚀 Quick Deployment Reference

## Vercel (Frontend) - Fill These Values:

### Basic Settings:
```
Project Name: krp-attendance-project
Framework: Vite (already selected ✅)
Root Directory: KRP Admin Dashboard Design
```

### Build Settings (Already Correct ✅):
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Environment Variables:
```
Key: VITE_API_URL
Value: http://localhost:5000
```
(Baad mein Render URL se replace karenge)

---

## Render (Backend) - Fill These Values:

### Basic Settings:
```
Name: krp-attendance-backend
Region: Singapore
Branch: main
Root Directory: KRP Admin Dashboard Design/server
```

### Build Settings:
```
Build Command: npm install
Start Command: node server.js
```

### Instance Type:
```
Free ($0/month)
```

### Environment Variables (6 total):
```
1. PORT = 5000
2. MONGODB_URI = mongodb+srv://220390107031_db_user:ABC123@cluster0.xzdo9u2.mongodb.net/krp_academy_db?retryWrites=true&w=majority&appName=Cluster0
3. JWT_SECRET = krp_academy_jwt_secret_2024_secure_key
4. NODE_ENV = production
5. WEEKLY_PROJECT_LIMIT = 3
6. ATTENDANCE_THRESHOLD = 80
```

---

## 🎯 Deployment Order:

1. **First:** Deploy Backend on Render
2. **Second:** Deploy Frontend on Vercel
3. **Third:** Update VITE_API_URL in Vercel with Render URL

---

## 📱 Expected URLs:

```
Frontend: https://krp-attendance-project.vercel.app
Backend: https://krp-attendance-backend.onrender.com
```

---

## ✅ Checklist:

### Vercel:
- [ ] Root Directory: `KRP Admin Dashboard Design`
- [ ] Environment Variable: `VITE_API_URL` added
- [ ] Click Deploy

### Render:
- [ ] Root Directory: `KRP Admin Dashboard Design/server`
- [ ] All 6 environment variables added
- [ ] Instance Type: Free
- [ ] Click Deploy Web Service

---

Bas! Yeh values fill karo aur deploy karo! 🚀
