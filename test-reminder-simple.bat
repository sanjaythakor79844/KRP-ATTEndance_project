@echo off
echo Testing Low Attendance Reminder...
echo.

REM Mark attendance for Student 1 - Low attendance (40%)
curl -s -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"present\",\"date\":\"2026-02-01\",\"className\":\"Test\"}" >nul
curl -s -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"absent\",\"date\":\"2026-02-02\",\"className\":\"Test\"}" >nul
curl -s -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"absent\",\"date\":\"2026-02-03\",\"className\":\"Test\"}" >nul
curl -s -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"present\",\"date\":\"2026-02-04\",\"className\":\"Test\"}" >nul
curl -s -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"absent\",\"date\":\"2026-02-05\",\"className\":\"Test\"}" >nul

echo Student 1 attendance marked (2 present, 3 absent = 40%%)
echo.

REM Mark attendance for Student 2 - Good attendance (80%)
curl -s -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"present\",\"date\":\"2026-02-01\",\"className\":\"Test\"}" >nul
curl -s -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"present\",\"date\":\"2026-02-02\",\"className\":\"Test\"}" >nul
curl -s -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"absent\",\"date\":\"2026-02-03\",\"className\":\"Test\"}" >nul
curl -s -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"present\",\"date\":\"2026-02-04\",\"className\":\"Test\"}" >nul
curl -s -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"present\",\"date\":\"2026-02-05\",\"className\":\"Test\"}" >nul

echo Student 2 attendance marked (4 present, 1 absent = 80%%)
echo.

echo Checking summaries...
curl -s http://localhost:5000/api/attendance/all-summaries
echo.
echo.

echo Triggering automatic reminder...
curl -s -X POST http://localhost:5000/api/attendance/trigger-automatic -H "Content-Type: application/json"
echo.
echo.

echo Done! Check email: sanjaythakor47095@gmail.com
pause
