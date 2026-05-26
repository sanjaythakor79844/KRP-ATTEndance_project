@echo off
echo ========================================
echo KRP ATTENDANCE DASHBOARD - LOCAL TEST
echo ========================================
echo.
echo Starting local development environment...
echo This will open the dashboard on localhost
echo.

cd "KRP Admin Dashboard Design"

echo [1/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
)

echo.
echo [2/3] Starting backend server...
start "KRP Backend Server" cmd /k "cd server && npm start"
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting frontend dashboard...
start "KRP Frontend Dashboard" cmd /k "npm run dev"

echo.
echo ========================================
echo ✅ LOCAL DASHBOARD STARTED!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo.
echo 📝 TESTING INSTRUCTIONS:
echo 1. Wait 10 seconds for servers to start
echo 2. Open: http://localhost:5173
echo 3. Login with password: krp@2024
echo 4. Go to Attendance page
echo 5. Select any date (today or previous)
echo 6. Click Present/Absent/Late buttons
echo 7. Watch for:
echo    - Toast notification (bottom-right)
echo    - Button color change (solid green/red/yellow)
echo    - Count update in summary cards
echo    - Checkmark (✓) on button
echo.
echo 💡 This is LOCALHOST - No cache issues!
echo 💡 You'll see changes immediately!
echo.
echo Press any key to exit (servers will keep running)...
pause >nul
