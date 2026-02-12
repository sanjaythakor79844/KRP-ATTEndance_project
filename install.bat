@echo off
echo ========================================
echo KRP Admin Dashboard - Gmail Integration
echo Installation Script
echo ========================================
echo.

echo [1/3] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
echo.

echo [2/3] Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    cd ..
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed
echo.

echo [3/3] Creating config directory...
if not exist "config" mkdir config
echo ✓ Config directory ready
echo.

cd ..

echo ========================================
echo Installation Complete! ✓
echo ========================================
echo.
echo Next Steps:
echo 1. Follow QUICK_START.md to set up Gmail
echo 2. Place gmail-credentials.json in server/config/
echo 3. Run start.bat to launch the application
echo.
echo Documentation:
echo - QUICK_START.md - 10-minute setup guide
echo - GMAIL_SETUP.md - Detailed Gmail setup
echo - MIGRATION_GUIDE.md - Migration from WhatsApp
echo.
pause
