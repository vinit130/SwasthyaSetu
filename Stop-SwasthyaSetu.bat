@echo off
title Stop SwasthyaSetu
echo Stopping SwasthyaSetu...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    taskkill /F /PID %%a 2>nul
)
echo SwasthyaSetu has been stopped.
timeout /t 2 /nobreak >nul
exit
