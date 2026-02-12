@echo off
echo.
echo ========================================
echo   Testing All Email Templates
echo ========================================
echo.
echo This will test all 6 professional email templates
echo.
pause

echo.
echo [1/6] Testing Attendance Warning Email (^< 80%%)...
curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"absent\",\"date\":\"%date:~-4%-%date:~4,2%-%date:~7,2%\",\"className\":\"Test Class\"}"
timeout /t 2 /nobreak >nul

echo.
echo [2/6] Testing Attendance Congratulations Email (^>= 80%%)...
curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"present\",\"date\":\"%date:~-4%-%date:~4,2%-%date:~7,2%\",\"className\":\"Test Class\"}"
timeout /t 2 /nobreak >nul

echo.
echo [3/6] Sending attendance notifications...
curl -X POST http://localhost:5000/api/attendance/check-and-notify -H "Content-Type: application/json"
timeout /t 2 /nobreak >nul

echo.
echo [4/6] Testing Attendance Manager Reminder...
curl -X POST http://localhost:5000/api/attendance/send-manager-reminder -H "Content-Type: application/json" -d "{\"managerId\":\"1\"}"
timeout /t 2 /nobreak >nul

echo.
echo [5/6] Testing Broadcast Message...
curl -X POST http://localhost:5000/api/broadcast -H "Content-Type: application/json" -d "{\"subject\":\"Test Broadcast\",\"message\":\"This is a test broadcast message to verify the professional template.\",\"studentIds\":[\"1\",\"2\"]}"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Template Testing Complete!
echo ========================================
echo.
echo Check your email inbox for:
echo   1. Attendance Warning (Red) - if student 1 has ^< 80%%
echo   2. Attendance Congratulations (Green) - if student 2 has ^>= 80%%
echo   3. Attendance Manager Reminder (Yellow)
echo   4. Broadcast Message (Blue)
echo.
echo Note: Project templates will be tested when you:
echo   - Send a project assignment from Projects tab
echo   - Respond to a project (Accept/Decline/Skip)
echo.
pause
