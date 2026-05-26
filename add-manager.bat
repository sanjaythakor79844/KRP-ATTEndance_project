@echo off
echo Adding Manager to Production Database...
echo.

curl -X POST https://krp-attendance-project.onrender.com/api/attendance/managers ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Kajol\",\"email\":\"teamkajolrpaswwan@gmail.com\",\"phone\":\"\"}"

echo.
echo.
echo Done! Manager added.
echo.
echo Verify at: https://krp-attendance-project.onrender.com/api/attendance/managers
echo.
pause
