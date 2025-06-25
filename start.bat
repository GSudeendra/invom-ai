@echo off
setlocal enabledelayedexpansion

REM 1. Check for node and npm
where node >nul 2>nul || (echo Error: node is not installed. & exit /b 1)
where npm >nul 2>nul || (echo Error: npm is not installed. & exit /b 1)

REM 2. Start backend
cd backend
REM Check if node_modules exists, or if package-lock.json is newer than node_modules
if not exist node_modules (echo Installing backend dependencies... & npm install)
if exist package-lock.json if exist node_modules (
  for %%F in (package-lock.json) do set PLJ=%%~tF
  for %%F in (node_modules) do set NMD=%%~tF
  if "!PLJ!" GTR "!NMD!" (
    echo Detected newer package-lock.json, installing backend dependencies...
    npm install
  )
)
echo Starting backend...
start "ETF Backend" cmd /k "npm start"
REM Wait 5 seconds for backend to start
ping -n 6 127.0.0.1 >nul

REM 3. Start frontend
cd ..\etf-dashboard-frontend
if not exist node_modules (echo Installing frontend dependencies... & npm install)
if exist package-lock.json if exist node_modules (
  for %%F in (package-lock.json) do set PLJ=%%~tF
  for %%F in (node_modules) do set NMD=%%~tF
  if "!PLJ!" GTR "!NMD!" (
    echo Detected newer package-lock.json, installing frontend dependencies...
    npm install
  )
)
echo Starting frontend...
start "ETF Frontend" cmd /k "npm start"
REM Wait 5 seconds for frontend to start
ping -n 6 127.0.0.1 >nul

REM 4. Open frontend in browser
start http://localhost:3000

cd ..
echo ETF Dashboard started! Backend (port 3001), Frontend (port 3000).
echo To stop: close the opened terminal windows for backend and frontend. 