@echo off
echo.
echo ========================================
echo   Testing Low Attendance Reminder
echo ========================================
echo.
echo This will:
echo 1. Mark some attendance records
echo 2. Trigger automatic reminder check
echo 3. Send emails to students with ^< 80%% attendance
echo.
pause

echo.
echo [Step 1] Marking attendance for Student 1 (Sanjay) - Creating low attendance...
echo.

REM Mark 5 days - 2 present, 3 absent = 40% attendance
curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"present\",\"date\":\"2026-02-01\",\"className\":\"Test\"}"
timeout /t 1 /nobreak >nul

curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"absent\",\"date\":\"2026-02-02\",\"className\":\"Test\"}"
timeout /t 1 /nobreak >nul

curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"absent\",\"date\":\"2026-02-03\",\"className\":\"Test\"}"
timeout /t 1 /nobreak >nul

curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"present\",\"date\":\"2026-02-04\",\"className\":\"Test\"}"
timeout /t 1 /nobreak >nul

curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"1\",\"status\":\"absent\",\"date\":\"2026-02-05\",\"className\":\"Test\"}"
timeout /t 1 /nobreak >nul

echo.
echo [Step 2] Marking attendance for Student 2 (Shyanjali) - Creating good attendance...
echo.

REM Mark 5 days - 4 present, 1 absent = 80% attendance
curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"present\",\"date\":\"2026-02-01\",\"className\":\"Test\"}"
timeout /t 1 /nobreak >nul

curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"present\",\"date\":\"2026-02-02\",\"className\":\"Test\"}"
timeout /t 1 /nobreak >nul

curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"absent\",\"date\":\"2026-02-03\",\"className\":\"Test\"}"
timeout /t 1 /nobreak >nul

curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"present\",\"date\":\"2026-02-04\",\"className\":\"Test\"}"
timeout /t 1 /nobreak >nul

curl -X POST http://localhost:5000/api/attendance/mark -H "Content-Type: application/json" -d "{\"studentId\":\"2\",\"status\":\"present\",\"date\":\"2026-02-05\",\"className\":\"Test\"}"
timeout /t 1 /nobreak >nul

echo.
echo [Step 3] Checking attendance summaries...
echo.
curl http://localhost:5000/api/attendance/all-summaries
timeout /t 2 /nobreak >nul

echo.
echo.
echo [Step 4] Triggering automatic reminder check...
echo.
curl -X POST http://localhost:5000/api/attendance/trigger-automatic -H "Content-Type: application/json"

echo.
echo.
echo ========================================
echo   Test Complete!
echo ========================================
echo.
echo Expected Results:
echo   - Student 1 (Sanjay): 40%% attendance
echo     Should receive WARNING email (Red)
echo.
echo   - Student 2 (Shyanjali): 80%% attendance
echo     Should NOT receive reminder (^>= 80%%)
echo.
echo Check email: sanjaythakor47095@gmail.com
echo.
pause
