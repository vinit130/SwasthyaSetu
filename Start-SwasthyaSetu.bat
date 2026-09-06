@echo off
title SwasthyaSetu Launcher
echo Starting SwasthyaSetu Rural Healthcare Platform...
cd /d "%~dp0"
start "" /b node server/server.js
timeout /t 2 /nobreak >nul
start http://localhost:5000
echo =======================================================
echo SwasthyaSetu is open in your browser: http://localhost:5000
echo To close, run Stop-SwasthyaSetu.bat
echo =======================================================
exit
