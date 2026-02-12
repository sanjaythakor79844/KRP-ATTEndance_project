@echo off
echo ========================================
echo KRP Admin Dashboard - Gmail Integration
echo Starting Application...
echo ========================================
echo.

echo Checking Gmail credentials...
if not exist "server\config\gmail-credentials.json" (
    echo.
    echo WARNING: Gmail credentials not found!
    echo Please follow these steps:
    echo 1. See QUICK_START.md for setup instructions
    echo 2. Place gmail-credentials.json in server\config\
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)
echo ✓ Gmail credentials found
echo.

echo Starting MongoDB...
echo Make sure MongoDB is running on localhost:27017
echo If not installed, download from: https://www.mongodb.com/try/download/community
echo.
timeout /t 3 /nobreak >nul

echo Starting backend server...
cd "KRP Admin Dashboard Design\server"
start "KRP Backend - Gmail Server" cmd /k "npm start"
echo ✓ Backend starting on http://localhost:5000
echo.
timeout /t 3 /nobreak >nul

echo Starting frontend application...
cd ..
start "KRP Frontend - Dashboard" cmd /k "npm run dev"
echo ✓ Frontend starting on http://localhost:3000
echo.

echo ========================================
echo Application Started! ✓
echo ========================================
echo.
echo Services:
echo - Backend:  http://localhost:5000
echo - Frontend: http://localhost:3000
echo - Gmail:    Connect via dashboard
echo.
echo API Endpoints:
echo - Health:   http://localhost:5000/api/health
echo - Gmail:    http://localhost:5000/api/gmail/status
echo.
echo Next Steps:
echo 1. Open http://localhost:3000 in your browser
echo 2. Navigate to Gmail Integration
echo 3. Click "Connect Gmail" and authorize
echo 4. Start using the dashboard!
echo.
echo Documentation:
echo - QUICK_START.md - Quick setup guide
echo - GMAIL_SETUP.md - Detailed Gmail setup
echo - README.md - Full documentation
echo.
echo Press any key to exit this window...
echo (Backend and Frontend will continue running)
pause >nul
