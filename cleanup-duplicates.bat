@echo off
echo.
echo ========================================
echo   Attendance Duplicate Cleanup
echo ========================================
echo.
echo Cleaning up duplicate attendance records...
echo.

curl -X POST https://krp-attendance-project.onrender.com/api/attendance/cleanup-duplicates

echo.
echo.
echo Cleanup request sent!
echo Check the response above for results.
echo.
pause
