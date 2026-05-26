@echo off
echo ========================================
echo Gmail Integration Testing
echo ========================================
echo.
echo Your Email: sanjaythakor47095@gmail.com
echo Server: http://localhost:5000
echo.

echo [1/5] Checking Gmail Status...
curl -s http://localhost:5000/api/gmail/status
echo.
echo.

timeout /t 2 /nobreak >nul

echo [2/5] Sending Test Email...
curl -s -X POST http://localhost:5000/api/gmail/send ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"sanjaythakor47095@gmail.com\",\"subject\":\"Test Email from KRP\",\"message\":\"<h1>Hello Sanjay!</h1><p>Your Gmail integration is working perfectly!</p><p>This is a test email.</p>\"}"
echo.
echo.

timeout /t 2 /nobreak >nul

echo [3/5] Sending Attendance Reminder...
curl -s -X POST http://localhost:5000/api/attendance/trigger ^
  -H "Content-Type: application/json" ^
  -d "{\"subject\":\"Test Attendance Reminder\"}"
echo.
echo.

timeout /t 2 /nobreak >nul

echo [4/5] Sending Broadcast Message...
curl -s -X POST http://localhost:5000/api/broadcast ^
  -H "Content-Type: application/json" ^
  -d "{\"subject\":\"Test Broadcast\",\"message\":\"<h2>Test Announcement</h2><p>This is a test broadcast message from KRP Admin Dashboard.</p>\",\"studentIds\":[\"1\",\"2\"]}"
echo.
echo.

timeout /t 2 /nobreak >nul

echo [5/5] Getting Students List...
curl -s http://localhost:5000/api/students
echo.
echo.

echo ========================================
echo Testing Complete!
echo ========================================
echo.
echo Check your email inbox:
echo sanjaythakor47095@gmail.com
echo.
echo You should receive:
echo 1. Test Email
echo 2. Attendance Reminder
echo 3. Broadcast Message
echo.
echo If emails not received:
echo - Check spam folder
echo - Verify Gmail is connected
echo - See EMAIL_TESTING_GUIDE.md
echo.
pause
