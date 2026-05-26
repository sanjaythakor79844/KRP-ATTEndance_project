@echo off
echo ========================================
echo GMAIL CREDENTIALS FOR RENDER
echo ========================================
echo.
echo Copy the line below and paste it into Render GMAIL_CREDENTIALS:
echo.
echo ----------------------------------------

powershell -Command "(Get-Content 'server\config\gmail-credentials.json' -Raw) -replace '\s+', ' ' -replace ' }', '}' -replace ' ]', ']' -replace '\[ ', '[' -replace '{ ', '{'"

echo ----------------------------------------
echo.
echo STEPS:
echo 1. Copy the line above (the long JSON text)
echo 2. Go to: https://dashboard.render.com
echo 3. Click: krp-attendance-project
echo 4. Click: Environment
echo 5. Find: GMAIL_CREDENTIALS
echo 6. Click: Edit
echo 7. Paste the copied text
echo 8. Click: Save Changes
echo 9. Wait 2-3 minutes for redeploy
echo.
echo Press any key to close...
pause >nul
