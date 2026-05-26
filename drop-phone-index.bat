@echo off
echo ========================================
echo DROP PHONE INDEX FROM MONGODB
echo ========================================
echo.
echo This will remove the phone field unique index from MongoDB
echo.
cd server
node drop-phone-index.js
echo.
echo ========================================
echo DONE!
echo ========================================
pause
